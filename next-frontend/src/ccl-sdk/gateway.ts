import { MsgExecuteContractParams, MsgInstantiateContractParams, MsgInstantiateContractResponse, TxResultCode } from "secretjs";
import { Contract, CosmosCredential, GatewayExecuteMsg as GatewayExecuteMsg, InitMsg, GatewayQueryMsg } from "./types";
import { codeMultiConfigExists, loadCodeMultiConfig, loadContractMultiConfig } from "./config";
import { getConsumerWallet, secretClient } from "./clients";
import { getEncryptedSignedMsg } from "./crypto";
import { OfflineAminoSigner } from "@cosmjs/amino";
import { AminoWallet } from "secretjs/dist/wallet_amino";


export const instantiateExamples = async () : Promise<Contract[]> => {
    
    if (!codeMultiConfigExists()) {
        const contracts : Contract[] = []; 
        const config = loadCodeMultiConfig();
        
        for (const code of [config.secrets!, config.votes!, config.auctions!]) {
            const { code_id, code_hash } = code;
            const init_msg : InitMsg = {}
            const msg : MsgInstantiateContractParams = {
                code_id,
                code_hash,
                sender: secretClient.address,
                label: `test-${Math.round(Date.now() / 1000)}`,
                init_msg
            }
    
        
            const tx = await secretClient.tx.compute.instantiateContract(msg, { gasLimit: 300_000 });
    
            if (tx.code !==  TxResultCode.Success) {
                throw new Error(`Error while instantiating contract: ${tx.rawLog}`);
            }
    
            const address = MsgInstantiateContractResponse.decode(tx.data[0]).address;
            contracts.push({ address, hash: code_hash })
        }
        return contracts;

    } else {
        const cc = loadContractMultiConfig();
        return [cc.secrets, cc.votes, cc.auctions];
    }


}




export const getGatewayEncryptionKey = async (contract: Contract) => {
    const res = await queryGateway(contract, { encryption_key: {} });
    return res as string;
}




export async function queryGateway<I> (contract: Contract, query: GatewayQueryMsg<I>) {
    const res = await secretClient.query.compute.queryContract({
        contract_address: contract.address,
        code_hash: contract.hash,
        query
    });
    return res;
}


export function queryGatewayAuth<I>(contract: Contract, query: I, credentials: CosmosCredential[])  {
    return queryGateway(
        contract,
        {
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
            wallet ?? await getConsumerWallet(),
            execute_msg,
            gatewayKey
        )
    )
}



