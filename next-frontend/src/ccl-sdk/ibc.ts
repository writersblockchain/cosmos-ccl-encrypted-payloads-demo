import { loadContractConfig } from "./config";
import { Contract, ExtendedMethods, GatewayExecuteMsg } from "./types";
import { getEncryptedSignedMsg } from "./crypto";
import { OfflineAminoSigner } from "@cosmjs/amino";
import { AminoWallet } from "secretjs/dist/wallet_amino";
import type { MsgTransferEncodeObject } from "@cosmjs/stargate";
import { MsgTransferResponse, type MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import { SigningStargateClient } from "@cosmjs/stargate"
import { sleep } from "./utils";


const  IBC_PORT  = "transfer"


export const sendIBCToken = async (
    client: SigningStargateClient,
    sender: string,
    receiver: string,
    denom: string,
    amount: string,
    sourceChannel: string,
    memo: string = "",
    timeoutTimestamp?: string
) => {

 
    const transferMsg : Partial<MsgTransfer> = {
        sourcePort: IBC_PORT,
        sourceChannel,
        token: { denom, amount },
        sender,
        receiver,
        memo,
        timeoutTimestamp: BigInt(timeoutTimestamp ?? (Date.now() + 300_000) * 1_000_000),
                // defaults to 5 minutes from now
    }
    

    console.log("ibc send msg:", transferMsg)
    
    const msg : MsgTransferEncodeObject = {
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: transferMsg
    }

    const tx = await client.signAndBroadcast(
        sender,
        [msg],
        "auto",
    )


    const res = MsgTransferResponse.fromJSON(tx.msgResponses[0])
    // success decoding the response
    res.sequence

    console.log("ibc send tx hash:", tx.transactionHash, "\n")

    const mintscanUrl = `https://www.mintscan.io/osmosis/tx/${tx.transactionHash}`;

    alert(`Encryted Transaction URL: ${mintscanUrl}`);

    // wait for the acknoledgement
    await sleep(20000);

    return tx;
}




export function gatewayHookMemo<E = ExtendedMethods> (
    msg : E,
    contract? : Contract
) {
    contract ??= loadContractConfig().gateway!;

    return JSON.stringify({
        wasm: {
            contract: contract.address,
            msg
        }
    });
}

export async function gatewayChachaHookMemo<E = ExtendedMethods> (
    wallet:  OfflineAminoSigner | AminoWallet,
    execute_msg : E,
    chainId: string,
    contract : Contract,
    gatewayKey? : string
)  {
    contract ??= loadContractConfig().gateway!;

    const msg = await getEncryptedSignedMsg<E>(
        contract,
        wallet,
        execute_msg,
        gatewayKey,
        chainId
    );

    return JSON.stringify({
        wasm: {
            contract: contract.address,
            msg
        }
    });
}