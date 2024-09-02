import { getGatewayEncryptionKey, queryGatewayAuth } from '../ccl-sdk/gateway';
import { gatewayChachaHookMemo, sendIBCToken } from '../ccl-sdk/ibc';
import { loadContractConfig, loadIbcConfig } from '../ccl-sdk/config';
import { useContext} from 'react';

import { CosmosjsContext } from "../utils/CosmosContext";
//
import { toBase64, toUtf8 } from '@cosmjs/encoding';
import { CosmosCredential } from '@/ccl-sdk/types';



const ExecuteGateway = () => {
    const context = useContext(CosmosjsContext);

    let cosmosjs = context?.cosmosjs; 
    let keplrAddress = context?.keplrAddress;
    let chainId = context?.chainId;
    let token = context?.token;


    let execute_gateway_contract = async (user_string: string) => {

        const ibcConfig = loadIbcConfig(chainId);
        const secretGateway = loadContractConfig().gateway!;
        const gatewayKey = await getGatewayEncryptionKey();

        // console.log("ibcConfig", ibcConfig);
        // console.log("secretGateway", secretGateway);

   
        (window as any).keplr.defaultOptions = {
          sign: {
            preferNoSetFee: false,
            disableBalanceCheck: true,
          },
        };
    
     let keplrOfflineSigner = (window as any).getOfflineSigner(chainId);
      
     console.log("cosmosjs", cosmosjs);
     console.log("keplrAddress", keplrAddress);
     console.log("chainId", chainId);
     console.log("token", token);
     console.log("keplrOfflineSigner", keplrOfflineSigner);

        const response = await sendIBCToken(
          cosmosjs!,
            keplrAddress!,
            secretGateway.address,
            token!,
            "1",
            ibcConfig.consumer_channel_id,
            await gatewayChachaHookMemo(
                keplrOfflineSigner,
                { extension: { msg: { store_secret: { text: user_string } } } },
                chainId!,
                secretGateway,
                gatewayKey
            )
        )
        console.log(response);
       
      
};

    return {
        execute_gateway_contract
    };
};


const QueryGateway = () => {
  const context = useContext(CosmosjsContext);

  let keplrAddress = context?.keplrAddress;
  let chainId = context?.chainId;

  let query_gateway_contract = async (message : string = "Query Permit") : Promise<string> => {

      const storageKey = chainId + ":queryPermit";
      const queryPermitStored = localStorage.getItem(storageKey);

      let credential : CosmosCredential; 

      if (queryPermitStored) {
        credential = JSON.parse(queryPermitStored) as CosmosCredential;
      } else {
        const signRes = await (window as any).keplr.signArbitrary(chainId, keplrAddress!, message)
        credential = {
          message: toBase64(toUtf8(message)),
          signature: signRes.signature,
          pubkey: signRes.pub_key.value,
          hrp: keplrAddress!.split("1")[0]
        }
        localStorage.setItem(storageKey, JSON.stringify(credential));
      }

      const res = await queryGatewayAuth({ get_secret: { }}, [credential]) as string
      console.log("res:", res);
      
      return res;
  }

  return {
    query_gateway_contract
  };
};

export { ExecuteGateway, QueryGateway };
