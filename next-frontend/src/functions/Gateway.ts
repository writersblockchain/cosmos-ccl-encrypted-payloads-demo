import { getGatewayEncryptionKey, queryGatewayAuth } from '../ccl-sdk/gateway';
import { gatewayChachaHookMemo, sendIBCToken } from '../ccl-sdk/ibc';
import { loadContractConfig, loadContractMultiConfig, loadIbcConfig } from '../ccl-sdk/config';
import { useContext} from 'react';

import { CosmosjsContext } from "../utils/CosmosContext";
//
import { toBase64, toUtf8 } from '@cosmjs/encoding';
import { Contract, CosmosCredential } from '@/ccl-sdk/types';



const ExecuteGateway = () => {
  const context = useContext(CosmosjsContext);

  let cosmosjs = context?.cosmosjs; 
  let keplrAddress = context?.keplrAddress;
  let chainId = context?.chainId;
  let token = context?.token;

  const contractConfig = loadContractMultiConfig();

  (window as any).keplr.defaultOptions = {
    sign: {
      preferNoSetFee: false,
      disableBalanceCheck: true,
    },
  };

  const keplrOfflineSigner = (window as any).getOfflineSigner(chainId);


  const execute_gateway_contract = async (
    contract: Contract,
    msg: object
  ) => {
    const ibcConfig = loadIbcConfig(chainId);

    const response = await sendIBCToken(
      cosmosjs!,
      keplrAddress!,
      contract.address,
      token!,
      "1",
      ibcConfig.consumer_channel_id,
      await gatewayChachaHookMemo(
          keplrOfflineSigner,
          { extension: { msg } },
          chainId!,
          contract,
      )
    )
    return response;
  };  

  const store_secret = async (user_string: string, gatewayKey?: string) => {
      const contract = contractConfig.secrets;
      gatewayKey ??= await getGatewayEncryptionKey(contract);
      const msg = { store_secret: { text: user_string } }
      return await (execute_gateway_contract(contract, msg));
  };

  const create_proposal = async (name: string, description: string, end_time?: string) => {
      const contract = contractConfig.votes;
      //end_time ??= new Date().toISOString();
      const msg = { create_proposal: { name, description, end_time } }
      return await (execute_gateway_contract(contract, msg));
  }

  const vote_proposal = async (proposal_id: number, vote: string) => {
      const contract = contractConfig.votes;
      const msg = { vote: { proposal_id, vote } }
      return await (execute_gateway_contract(contract, msg));
  }

  const create_auction = async (name: string, description: string, end_time?: string) => {
      const contract = contractConfig.auctions;
      //end_time ??= new Date().toISOString();
      const msg = { create_auction_item: { name, description, end_time } }
      return await (execute_gateway_contract(contract, msg));
  }

  const bid_auction = async (auction_id: number, amount: string) => {
      const contract = contractConfig.auctions;
      const msg = { bid: { auction_id, amount } }
      return await (execute_gateway_contract(contract, msg));
  }

  return {
      execute_gateway_contract, store_secret, 
      create_proposal, vote_proposal,
      create_auction, bid_auction
  };
};


const QueryGateway = () => {
  const context = useContext(CosmosjsContext);

  let keplrAddress = context?.keplrAddress;
  let chainId = context?.chainId;
  const contractConfig = loadContractMultiConfig();
  
  const query_gateway_contract = async (
    contract: Contract,
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

      const res = await queryGatewayAuth(contract, query, [credential]);
      console.log("query:", query, " res:", res);
      return res;
  }

  const query_secret = (message : string = "Query Permit") : Promise<string> => {
    return query_gateway_contract(contractConfig.secrets, { get_secret: { }}, message) as Promise<string>;
  }

  const query_proposals = (message?: string)  => {
    return query_gateway_contract(contractConfig.votes, { proposals: { }}, message);
  }

  const query_my_vote = (proposal_id: number, message?: string) => {
    return query_gateway_contract(contractConfig.votes, { my_vote: { proposal_id }}, message);
  }

  const query_auctions = (message?: string) => {
    return query_gateway_contract(contractConfig.auctions, { auctions: { }}, message);
  } 

  const query_my_bid = (auction_id: number, message?: string)  => {
    return query_gateway_contract(contractConfig.auctions, { my_bid: { auction_id }}, message);
  }

  const query_auction_result = (auction_id: number, message?: string) => {
    return query_gateway_contract(contractConfig.auctions, { result: { auction_id }}, message);
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
