import { expect, describe, it, beforeAll } from 'vitest';
import { executeGatewayEncrypted, getGatewayEncryptionKey, queryGatewayAuth } from '../src/gateway';
import { consumerWallet, secretWallet } from '../src/clients';
import { getQueryCredential } from '../src/crypto';
import { loadContractConfig, loadIbcConfig } from '../src/config';
import { CONSUMER_CHAIN_ID } from '../src/env';


describe('Gateway contract interaction', () => {

    let gatewayKey : string | undefined;
    const ibcConfig = loadIbcConfig();
    const contract = loadContractConfig().gateway!;
    const chainId = CONSUMER_CHAIN_ID!;

    beforeAll(async () => {
        gatewayKey = await getGatewayEncryptionKey(contract);
        console.log("Gateway key:", gatewayKey)
    });
    

    describe('setting secret encrypted text', async () => {
        // simply signing a 036 message withour encryption
        // only for queries (no replay-attack protection)
        const consumerQueryCredential = await getQueryCredential(consumerWallet, contract, chainId)
        const secretQueryCredential = await getQueryCredential(secretWallet, contract, chainId)

        it('should be able to to set secret texts', async () => {
            const old_text = (
                await queryGatewayAuth(
                    contract,
                    { get_secret: {} }, 
                    [consumerQueryCredential]
                )
            ) as string;

            const new_text = "new_text_" + Math.random().toString(36).substring(7);
            expect(old_text).not.toEqual(new_text);
            
            // called with regular  authentication + encryption 
            // regular secret wallet relaying the message
            await executeGatewayEncrypted(
                contract,
                { extension: { msg: { store_secret: { text: new_text } } } },
                consumerWallet,
                gatewayKey
            )
            
            // secret wallet is relaying the queries but
            // it can't read anyting by itself without passed credentials 
            const non_auth_text = (await queryGatewayAuth(
                contract,
                { get_secret: {} },
                []
            )) as string;
            expect(non_auth_text.toLowerCase()).toContain("must not be empty");


            // the consumer can read the secret text
            const updated_text = (await queryGatewayAuth(
                contract,
                { get_secret: {} },
                [consumerQueryCredential]
            )) as string;
            expect(updated_text).toEqual(new_text);


            // the secret wallet can pass it's own credentials
            // but can only access a secret text of it's own
            const secret_text = (await queryGatewayAuth(
                contract,
                { get_secret: {} },
                [secretQueryCredential]
            )) as string;
            expect(secret_text).not.toEqual(new_text);
        });

    });


});
