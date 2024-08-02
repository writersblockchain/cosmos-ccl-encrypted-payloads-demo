import { coinFromString, type SecretNetworkClient, fromUtf8 } from "secretjs";
import { MsgAcknowledgement } from "secretjs/dist/protobuf/ibc/core/channel/v1/tx";
import { loadContractConfig } from "./config";
import { Contract, GatewayExecuteMsg } from "./types";
import { getEncryptedSignedMsg } from "./crypto";
import { OfflineAminoSigner } from "@cosmjs/amino";
import { AminoWallet } from "secretjs/dist/wallet_amino";

const IBC_PORT = "transfer";

export const sendIBCToken = async (
    client: SecretNetworkClient,
    receiver: string,
    token: string,
    amount: string,
    source_channel: string,
    memo: string = "",
    timeout_timestamp?: string
) => {
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

    if (!ibcResponse) return res;
    console.log("Broadcasted IbcTX. Waiting for Ack:", ibcResponse);
    const ibcRes = await ibcResponse;

    console.log("ibc Ack Received!");

    const packet = ibcRes.tx.tx.body?.messages?.[1];

    const config = loadContractConfig();

    if (receiver == config.gateway?.address) {
        const info = await MsgAcknowledgement.fromJSON(packet);

        console.log("info ack:", info);

        const ack: any = JSON.parse(fromUtf8(info.acknowledgement));

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

export const gatewayHookMemo = (
    msg: GatewayExecuteMsg,
    contract?: Contract
) => {
    contract ??= loadContractConfig().gateway!;

    return JSON.stringify({
        wasm: {
            contract: contract.address,
            msg
        }
    });
};

export const gatewayChachaHookMemo = async (
    wallet: OfflineAminoSigner | AminoWallet,
    execute_msg: GatewayExecuteMsg,
    contract?: Contract,
    gatewayKey?: string
) => {
    contract ??= loadContractConfig().gateway!;

    const msg = await getEncryptedSignedMsg(
        wallet,
        execute_msg,
        gatewayKey
    );

    return JSON.stringify({
        wasm: {
            contract: contract.address,
            msg
        }
    });
};