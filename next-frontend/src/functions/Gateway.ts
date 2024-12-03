import { getGatewayEncryptionKey, queryGateway, queryGatewayAuth } from '../ccl-sdk/gateway';
import { gatewayChachaHookMemo, sendIBCToken } from '../ccl-sdk/ibc';
import { loadContractMultiConfig, loadIbcConfig } from '../ccl-sdk/config';
import { useContext} from 'react';

import { CosmosjsContext } from "../utils/CosmosContext";
import { toBase64, toUtf8 } from '@cosmjs/encoding';
import { Contract, CosmosCredential, DataToSign } from '@/ccl-sdk/types';
import { Random } from '@cosmjs/crypto';
import { Proposal } from '@/utils/types';



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

  const create_proposal = async (name: string, description: string, end_time: string = "60") => {
      const contract = contractConfig.votes;
      const msg = { create_proposal: { name, description, end_time } }
      return await (execute_gateway_contract(contract, msg));
  }

  const vote_proposal = async (proposal_id: string, vote: string) => {
      const contract = contractConfig.votes;
      const msg = { vote: { proposal_id, vote } }
      return await (execute_gateway_contract(contract, msg));
  }

  const create_auction = async (name: string, description: string, end_time: string = "60") => {
      const contract = contractConfig.auctions;
      const msg = { create_auction_item: { name, description, end_time } }
      return await (execute_gateway_contract(contract, msg));
  }

  const bid_auction = async (auction_id: string, amount: string) => {
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


  const query_contract_public = async (
    contract: Contract,
    query: any
  ) : Promise<any>  => {
    const res = await queryGateway(contract, query);
    console.log("query:", query, " res:", res);
    return res;
  }


  const query_contract_auth = async (
    contract: Contract,
    query: object,
    data : string = "Query Permit"
  ) : Promise<any>  => {

      const storageKey = `${keplrAddress}:${contract.address}:queryPermit}`;
      const queryPermitStored = localStorage.getItem(storageKey);

      let credential : CosmosCredential; 

      if (queryPermitStored) {
        credential = JSON.parse(queryPermitStored) as CosmosCredential;
      } else {
        const toSign : DataToSign = {
          chain_id: "secret-4",
          contract_address: contract.address,
          nonce: toBase64(Random.getBytes(32)),
          data: btoa(data)
        }
        const message = toUtf8(JSON.stringify(toSign));
        const signRes = await (window as any).keplr.signArbitrary(chainId, keplrAddress!, JSON.stringify(toSign))
        credential = {
          message: toBase64(message),
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


  const query_my_vote = (proposal_id: number, message?: string) => {
    return query_contract_auth(contractConfig.votes, { my_vote: { proposal_id }}, message);
  }

  const query_my_bid = (auction_id: number, message?: string)  => {
    return query_contract_auth(contractConfig.auctions, { my_bid: { auction_id }}, message);
  }

  const query_secret = () : Promise<string> => {
    return query_contract_auth(contractConfig.secrets, { get_secret: { }}) as Promise<string>;
  }

  const query_proposals = () : Promise<[number, Proposal][]>  => {
    return query_contract_public(contractConfig.votes, { extension: { query: { proposals: { } } } });
  }

  const query_auctions = () => {
    return query_contract_public(contractConfig.auctions, { extension: { query: { auctions: { } } } });
  } 

  const query_auction_result = (auction_id: number) => {
    return query_contract_public(contractConfig.auctions, { extension: { query: { result: { auction_id } } } });
  }


  return {
    query_gateway_contract: query_contract_auth,
    query_secret,
    query_proposals,
    query_my_vote,
    query_auctions,
    query_my_bid,
    query_auction_result
  };
};

export { ExecuteGateway, QueryGateway };
