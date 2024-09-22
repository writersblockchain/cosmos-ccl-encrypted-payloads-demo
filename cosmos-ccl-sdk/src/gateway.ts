import { MsgExecuteContractParams, MsgInstantiateContractParams, MsgInstantiateContractResponse, TxResultCode } from "secretjs";
import { Contract, CosmosCredential, InnerQueries, GatewayExecuteMsg as GatewayExecuteMsg, InitMsg, GatewayQueryMsg } from "./types";
import { loadCodeConfig } from "./config";
import { consumerWallet, secretClient } from "./clients";
import { getEncryptedSignedMsg } from "./crypto";
import { OfflineAminoSigner } from "@cosmjs/amino";
import { AminoWallet } from "secretjs/dist/wallet_amino";


export const instantiateStoredSecrets = async () : Promise<Contract> => {
    
    const config = loadCodeConfig();
    const code = config.gateway!;
    const hash = code.code_hash;

    const init_msg : InitMsg = {}
    const msg : MsgInstantiateContractParams = {
        code_id: code.code_id,
        code_hash: hash,
        sender: secretClient.address,
        label: `test-${Math.round(Date.now() / 1000)}`,
        init_msg
    }

    const tx = await secretClient.tx.compute.instantiateContract(msg, { gasLimit: 300_000 });

    if (tx.code !==  TxResultCode.Success) {
        throw new Error(`Error while instantiating contract: ${tx.rawLog}`);
    }

    const address = MsgInstantiateContractResponse.decode(tx.data[0]).address;
    return { address, hash }
}




export const getGatewayEncryptionKey = async (contract: Contract) => {
    const res = await queryGateway(contract, { encryption_key: {} });
    return res as string;
}




export const queryGateway = async (
    contract: Contract,
    query: GatewayQueryMsg
) => {
    const res = await secretClient.query.compute.queryContract({
        contract_address: contract.address,
        code_hash: contract.hash,
        query
    });
    return res;
}


export const queryGatewayAuth = (
    contract: Contract,
    query: InnerQueries, 
    credentials: CosmosCredential[]
) => {
    return queryGateway(contract, {
        with_auth_data: {
            query,
            auth_data: {
                credentials,
            }
        }
    })
}



export const executeGateway = async (
    contract: Contract,
    execute_msg: GatewayExecuteMsg
) => {

    const msg : MsgExecuteContractParams<GatewayExecuteMsg> = {
        msg: execute_msg,
        sender: secretClient.address,
        contract_address: contract.address,
        code_hash: contract.hash,
        sent_funds: [],
    }
    const tx = await secretClient.tx.compute.executeContract(msg, { gasLimit: 900_000 });
    return tx;
}



export const executeGatewayEncrypted = async (
    contract: Contract,
    execute_msg: GatewayExecuteMsg, 
    wallet?: OfflineAminoSigner | AminoWallet,
    gatewayKey?: string,
) => {

    return await executeGateway(
        contract,
        await getEncryptedSignedMsg(
            contract,
            wallet ?? consumerWallet,
            execute_msg,
            gatewayKey
        )
    )
}



