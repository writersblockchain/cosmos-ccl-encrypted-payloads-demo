import { SecretNetworkClient, Wallet } from "secretjs"
import { SigningStargateClient } from "@cosmjs/stargate"
import { Secp256k1HdWallet } from "@cosmjs/amino";
import { NonceWallet } from "./types";
import { NEXT_PUBLIC_CONSUMER_DECIMALS, NEXT_PUBLIC_CONSUMER_GAS_PRICE, NEXT_PUBLIC_CONSUMER_TOKEN } from "./env";
import { Decimal } from "@cosmjs/math";


export const secretWallet = new Wallet(process.env.NEXT_PUBLIC_SECRET_MNEMONIC);


export const secretClient = new SecretNetworkClient({
    chainId: process.env.NEXT_PUBLIC_SECRET_CHAIN_ID!,
    url: process.env.NEXT_PUBLIC_SECRET_CHAIN_ENDPOINT!,
    wallet: secretWallet,
    walletAddress: secretWallet.address,
});


let consumerWallet : Secp256k1HdWallet | undefined;
let consumerClient : SigningStargateClient | undefined;
let nonceWallets : { [nonce: string]: NonceWallet } = {};



export const getNonceWallet = async (base64Nonce : string) => {
    if (!nonceWallets[base64Nonce]) {
        nonceWallets[base64Nonce] = new NonceWallet();
    }
    return nonceWallets[base64Nonce];
}


export const getConsumerWallet = async () => {
    if (!consumerWallet) {
        consumerWallet = await Secp256k1HdWallet.fromMnemonic(process.env.NEXT_PUBLIC_CONSUMER_MNEMONIC!, { prefix: process.env.NEXT_PUBLIC_CONSUMER_PREFIX! });
    }
    return consumerWallet;
}


export const getConsumerClient = async (wallet? : Secp256k1HdWallet) => {
    if (!consumerClient) {
        if (!wallet && !consumerWallet) {
            throw new Error("No wallet avaialable");
        }
        consumerClient = await SigningStargateClient.connectWithSigner(
            process.env.NEXT_PUBLIC_CONSUMER_CHAIN_ENDPOINT!, 
            wallet ?? consumerWallet!,
            { gasPrice: { 
                denom: NEXT_PUBLIC_CONSUMER_TOKEN!, 
                amount: Decimal.fromUserInput(
                    process.env.NEXT_PUBLIC_CONSUMER_GAS_PRICE ?? "0.25", 
                    process.env.NEXT_PUBLIC_CONSUMER_DECIMALS ? Number(process.env.NEXT_PUBLIC_CONSUMER_DECIMALS) : 6
                ) 
            }}
        );
    }
    return consumerClient;
}
