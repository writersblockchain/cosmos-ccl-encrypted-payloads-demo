import { getGatewayEncryptionKey, queryGatewayAuth } from '../ccl-sdk/gateway';
import { consumerClient, consumerWallet } from '../ccl-sdk/clients';
import { getArb36Credential } from '../ccl-sdk/crypto';
import { gatewayChachaHookMemo, gatewayHookMemo, sendIBCToken } from '../ccl-sdk/ibc';
import { loadContractConfig, loadIbcConfig } from '../ccl-sdk/config';

let CONSUMER_TOKEN = "uaxl"

const ExecuteGateway = () => {

    let execute_gateway_contract = async (user_string: string) => {
      const gatewayKey = await getGatewayEncryptionKey();

      const consumerQCSecond = await getArb36Credential(consumerWallet, "bar");
  
      const ibcConfig = loadIbcConfig();
      const secretGateway = loadContractConfig().gateway!;
  
  
      // Send an authenticated & encrypted message
      const responseEncrypted = await sendIBCToken(
          consumerClient,
          secretGateway.address,
          CONSUMER_TOKEN!,
          "1",
          ibcConfig.consumer_channel_id,
          await gatewayChachaHookMemo(
              consumerWallet,
              { extension: { msg: { store_secret: { text: user_string } } } },
              secretGateway,
              gatewayKey
          )
      );
  
      console.log("Encrypted IBC Hook Response:", responseEncrypted);
  
      const encryptedStringQuery = (await queryGatewayAuth(
          { get_secret: {} },
          [consumerQCSecond]
      )) as string;
      
      console.log("Encrypted string:", encryptedStringQuery);
    }

    return {
        execute_gateway_contract
      };

};

export { ExecuteGateway };