import { getGatewayEncryptionKey, queryGatewayAuth } from '../ccl-sdk/gateway';
import { getConsumerClient, getConsumerWallet } from '../ccl-sdk/clients';
import { getArb36Credential } from '../ccl-sdk/crypto';
import { gatewayChachaHookMemo, gatewayHookMemo, sendIBCToken } from '../ccl-sdk/ibc';
import { loadContractConfig, loadIbcConfig } from '../ccl-sdk/config';
import {  useContext} from 'react';

import { CosmosjsContext } from "../utils/CosmosContext";
//
import { SigningStargateClient } from "@cosmjs/stargate"
import { Decimal } from "@cosmjs/math";
import { toBase64, toUtf8 } from '@cosmjs/encoding';


// let CONSUMER_TOKEN = "uaxl"
let CONSUMER_TOKEN = "uosmo"

const ExecuteGateway = () => {
    const context = useContext(CosmosjsContext);

    let cosmosjs = context?.cosmosjs; 
    let keplrAddress = context?.keplrAddress;

    let execute_gateway_contract = async (user_string: string) => {

        const ibcConfig = loadIbcConfig();
        const secretGateway = loadContractConfig().gateway!;
        const gatewayKey = await getGatewayEncryptionKey();

        // console.log("ibcConfig", ibcConfig);
        // console.log("secretGateway", secretGateway);

        await (window as any).keplr.enable("osmosis-1");
        (window as any).keplr.defaultOptions = {
          sign: {
            preferNoSetFee: false,
            disableBalanceCheck: true,
          },
        };
    
     let keplrOfflineSigner = (window as any).getOfflineSigner("osmosis-1");

     console.log("keplrOfflineSigner", keplrOfflineSigner);

        const response = await sendIBCToken(
          cosmosjs!,
            keplrAddress!,
            secretGateway.address,
            CONSUMER_TOKEN!,
            "1",
            ibcConfig.consumer_channel_id,
            await gatewayChachaHookMemo(
                keplrOfflineSigner,
                { extension: { msg: { store_secret: { text: user_string } } } },
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

  let cosmosjs = context?.cosmosjs; 
  let keplrAddress = context?.keplrAddress;


  let query_gateway_contract = async (chainId: string) : Promise<string> => {

      const keplr = (window as any).keplr;
      await keplr.enable(chainId);

      const signRes = await keplr.signArbitrary(chainId, keplrAddress!, "foo")
      console.log("signature", signRes);

      const credential = {
        message: toBase64(toUtf8("foo")),
        signature: signRes.signature,
        pubkey: signRes.pub_key.value,
        hrp: keplrAddress!.split("1")[0]
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
