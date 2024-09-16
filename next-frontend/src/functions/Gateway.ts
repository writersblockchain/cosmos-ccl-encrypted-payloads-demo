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


  const execute_gateway_contract = async (user_string: string) => {

      const ibcConfig = loadIbcConfig(chainId);
      const secretGateway = loadContractConfig().gateway!;
      const gatewayKey = await getGatewayEncryptionKey();

      (window as any).keplr.defaultOptions = {
        sign: {
          preferNoSetFee: false,
          disableBalanceCheck: true,
        },
      };

      const keplrOfflineSigner = (window as any).getOfflineSigner(chainId);

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

  
  const query_gateway_contract = async (
    query: object,
    credMessage : string = "Query Permit"
  ) : Promise<any>  => {

      const storageKey = chainId + ":queryPermit";
      const queryPermitStored = localStorage.getItem(storageKey);

      let credential : CosmosCredential; 

      if (queryPermitStored) {
        credential = JSON.parse(queryPermitStored) as CosmosCredential;
      } else {
        const signRes = await (window as any).keplr.signArbitrary(chainId, keplrAddress!, credMessage)
        credential = {
          message: toBase64(toUtf8(credMessage)),
          signature: signRes.signature,
          pubkey: signRes.pub_key.value,
          hrp: keplrAddress!.split("1")[0]
        }
        localStorage.setItem(storageKey, JSON.stringify(credential));
      }

      const res = await queryGatewayAuth(query, [credential]);
      console.log("query:", query, " res:", res);
      return res;
  }

  const query_secret = (message : string = "Query Permit") : Promise<string> => {
    return query_gateway_contract({ get_secret: { }}, message) as Promise<string>;
  }

  const query_proposals = (message?: string)  => {
    return query_gateway_contract({ proposals: { }}, message);
  }

  const query_my_vote = (proposal_id: number, message?: string) => {
    return query_gateway_contract({ my_vote: { proposal_id }}, message);
  }

  const query_auctions = (message?: string) => {
    return query_gateway_contract({ auctions: { }}, message);
  } 

  const query_my_bid = (auction_id: number, message?: string)  => {
    return query_gateway_contract({ my_bid: { auction_id }}, message);
  }

  const query_auction_result = (auction_id: number, message?: string) => {
    return query_gateway_contract({ result: { auction_id }}, message);
  }


  return {
    query_gateway_contract,
    query_secret,
    query_proposals,
    query_my_vote,
    query_auctions,
    query_my_bid,
    query_auction_result
  };
};

export { ExecuteGateway, QueryGateway };
