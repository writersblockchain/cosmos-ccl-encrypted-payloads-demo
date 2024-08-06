import { MsgInstantiateContractResponse, TxResultCode } from "secretjs";
import { loadCodeConfig, loadContractConfig } from "./config.js";
import { consumerWallet, secretClient } from "./clients.js";
import { getEncryptedSignedMsg } from "./crypto.js";
export const instantiateGatewaySimple = async () => {
    const config = loadCodeConfig();
    const code = config.gateway;
    const hash = code.code_hash;
    const init_msg = {};
    const msg = {
        code_id: code.code_id,
        code_hash: hash,
        sender: secretClient.address,
        label: `test-${Math.round(Date.now() / 1000)}`,
        init_msg
    };
    const tx = await secretClient.tx.compute.instantiateContract(msg, { gasLimit: 300000 });
    if (tx.code !== TxResultCode.Success) {
        throw new Error(`Error while instantiating contract: ${tx.rawLog}`);
    }
    const address = MsgInstantiateContractResponse.decode(tx.data[0]).address;
    return { address, hash };
};
export const getGatewayEncryptionKey = async () => {
    const res = await queryGateway({ encryption_key: {} });
    return res;
};
export const queryGateway = async (query) => {
    const config = loadContractConfig();
    const res = await secretClient.query.compute.queryContract({
        contract_address: config.gateway.address,
        code_hash: config.gateway.hash,
        query
    });
    return res;
};
export const queryGatewayAuth = (query, credentials) => {
    return queryGateway({
        with_auth_data: {
            query,
            auth_data: {
                credentials,
            }
        }
    });
};
export const executeGateway = async (execute_msg) => {
    const config = loadContractConfig();
    const msg = {
        msg: execute_msg,
        sender: secretClient.address,
        contract_address: config.gateway.address,
        code_hash: config.gateway.hash,
        sent_funds: [],
    };
    const tx = await secretClient.tx.compute.executeContract(msg, { gasLimit: 900000 });
    return tx;
};
export const executeGatewayEncrypted = async (execute_msg, wallet, gatewayKey) => {
    return await executeGateway(await getEncryptedSignedMsg(wallet ?? consumerWallet, execute_msg, gatewayKey));
};
