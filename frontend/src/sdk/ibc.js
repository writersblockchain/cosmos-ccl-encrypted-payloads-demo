import { coinFromString, fromUtf8 } from "secretjs";
import { MsgAcknowledgement } from "secretjs/dist/protobuf/ibc/core/channel/v1/tx.js";
import { loadContractConfig } from "./config.js";
import { getEncryptedSignedMsg } from "./crypto.js";
const IBC_PORT = "transfer";
export const sendIBCToken = async (client, receiver, token, amount, source_channel, memo = "", timeout_timestamp) => {
    console.log("Sending IBC token...");
    console.log("receiver:", receiver);
    console.log("token:", token);
    console.log("amount:", amount);
    console.log("source_channel:", source_channel);
    console.log("memo:", memo);
    console.log("\n\n\n");
    const res = await client.tx.ibc.transfer({
        sender: client.address,
        receiver,
        token: coinFromString(amount + token),
        source_port: IBC_PORT,
        source_channel,
        memo,
        timeout_timestamp: timeout_timestamp ?? String(Math.floor(Date.now() / 1000) + 300)
    }, {
        gasLimit: memo.length > 0 ? 400000 : 200000,
        feeDenom: token
    });
    const ibcResponse = res.ibcResponses[0];
    if (!ibcResponse)
        return res;
    console.log("Broadcasted IbcTX. Waiting for Ack:", ibcResponse);
    const ibcRes = await ibcResponse;
    console.log("ibc Ack Received!");
    const packet = ibcRes.tx.tx.body?.messages?.[1];
    const config = loadContractConfig();
    if (receiver == config.gateway?.address) {
        const info = await MsgAcknowledgement.fromJSON(packet);
        console.log("info ack:", info);
        const ack = JSON.parse(fromUtf8(info.acknowledgement));
        console.log("parsed ack:", ack);
        if ("error" in ack) {
            throw new Error("Error in ack: " + ack.error);
        }
        if (!("result" in ack)) {
            throw new Error("Result not found in ack");
        }
        const ackRes = Buffer.from(ack.result, 'base64').toString('utf-8');
        console.log("ackRes:", ackRes);
    }
    return res;
};
export const gatewayHookMemo = (msg, contract) => {
    contract ?? (contract = loadContractConfig().gateway);
    return JSON.stringify({
        wasm: {
            contract: contract.address,
            msg
        }
    });
};
export const gatewayChachaHookMemo = async (wallet, execute_msg, contract, gatewayKey) => {
    contract ?? (contract = loadContractConfig().gateway);
    const msg = await getEncryptedSignedMsg(wallet, execute_msg, gatewayKey);
    return JSON.stringify({
        wasm: {
            contract: contract.address,
            msg
        }
    });
};
