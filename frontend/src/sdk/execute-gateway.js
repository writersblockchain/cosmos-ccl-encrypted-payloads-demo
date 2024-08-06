import { getGatewayEncryptionKey, queryGatewayAuth } from './gateway.js';
import { consumerClient, consumerWallet } from './clients.js';
import { getArb36Credential } from './crypto.js';
import { gatewayChachaHookMemo, gatewayHookMemo, sendIBCToken } from './ibc.js';
import { loadContractConfig, loadIbcConfig } from './config.js';
import dotenv from 'dotenv';
dotenv.config();
let CONSUMER_TOKEN = process.env.CONSUMER_TOKEN;
const interactWithGatewayContract = async () => {
    const gatewayKey = await getGatewayEncryptionKey();
    const consumerQCFirst = await getArb36Credential(consumerWallet, "foo");
    const consumerQCSecond = await getArb36Credential(consumerWallet, "bar");
    const ibcConfig = loadIbcConfig();
    const secretGateway = loadContractConfig().gateway;
    // Send a non-authenticated & non-encrypted message
    const newTextSimple = "new_text_" + Math.random().toString(36).substring(7);
    const responseSimple = await sendIBCToken(consumerClient, secretGateway.address, CONSUMER_TOKEN, "1", ibcConfig.consumer_channel_id, gatewayHookMemo({ extension: { msg: { store_secret: { text: newTextSimple } } } }, secretGateway));
    console.log("Simple IBC Hook Response:", responseSimple);
    const nonUpdatedText = (await queryGatewayAuth({ get_secret: {} }, [consumerQCFirst]));
    console.log("Non-Updated Text:", nonUpdatedText);
    // Send an authenticated & encrypted message
    const newTextEncrypted = "new_text_" + Math.random().toString(36).substring(7);
    const responseEncrypted = await sendIBCToken(consumerClient, secretGateway.address, CONSUMER_TOKEN, "1", ibcConfig.consumer_channel_id, await gatewayChachaHookMemo(consumerWallet, { extension: { msg: { store_secret: { text: newTextEncrypted } } } }, secretGateway, gatewayKey));
    console.log("Encrypted IBC Hook Response:", responseEncrypted);
    const updatedText = (await queryGatewayAuth({ get_secret: {} }, [consumerQCSecond]));
    console.log("Updated Text:", updatedText);
};
interactWithGatewayContract().catch(error => {
    console.error("Error interacting with gateway contract:", error);
});
