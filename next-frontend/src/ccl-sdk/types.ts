import { AminoMsg } from "@cosmjs/amino";
import { Permit } from "secretjs";


export type Code = {
    code_id     :   number;
    code_hash   :   string;
}


export type MultiContract = {
    code_id     :   number;
    code_hash   :   string;
    address?    :   string;
    migrate?    :   boolean;
}


export type CodeConfig = {
    gateway?     :   Code;
    snip20?      :   Code;
}

export type CodeMultiConfig = {
    secrets?    :   Code;
    votes?      :   Code;
    auctions?   :   Code;
}

export type Contract = {
    address: string,
    hash:    string,
}


export type ContractConfig = {
    gateway?   :   Contract;
    sscrt?      :   Contract,
}


export type ContractMultiConfig = {
    secrets   :   Contract;
    votes     :   Contract;
    auctions  :   Contract;
}


export type IbcConfig = {
    secret_channel_id : string;
    consumer_channel_id : string;
    ibc_denom : string;
}


export type TokenData = {
    sscrt_contract   :  Contract,
}



export type CosmosCredential = {    
    pubkey      :   string,
    signature   :   string,
    message     :   string,
    hrp?        :   string
}


export type CosmosAuthData = {
    credentials      :   CosmosCredential[],
    primary_index?   :   number
}


export type Expiration = 
    { at_height: number }  | 
    { at_time: string }    | 
    { never: {} };


export type SessionConfig = {
    generate_on_auth?   :   boolean,
    can_view?           :   boolean,
    expires?            :   Expiration
}



export type DataToSign = {
    chain_id: string,
    contract_address: string,
    data: string | Uint8Array,
    nonce: string | Uint8Array
}



export type InitMsg = {
    admin?                   :       string
}




export type ExtendedMethods = 
    { store_secret: { text: string } }       



export type InnerQueries = 
    { get_secret: {} }   |
    { test: {} }        




export type GatewayExecuteMsg<E = ExtendedMethods> = 

    { reset_encryption_key: {} }         |

    { extension: { msg: E } }           |
    
    { encrypted: { 
        payload: string, 
        payload_signature: string, 
        payload_hash: string,
        user_key: string,
        nonce: string 
    }} 
    

export type EncryptedPayload = {
    user_address: string,
    user_pubkey: string,
    hrp: string,
    msg: string
}
    


export type GatewayQueryMsg<I = InnerQueries> = 

    { encryption_key: {} }              |

    { with_permit: { 
        query: I, 
        permit: Permit, 
        hrp?: string 
    }}                                  |

    { with_auth_data: { 
        query: I, 
        auth_data: CosmosAuthData 
    }}                                  



export type GatewayMsg<P = any> = {
    signer: string,
    payload: P,
    payload_hash: string,
    payload_signature: string,
    nonce: string,
}


export interface MsgSignData extends AminoMsg {
    readonly type: "sign/MsgSignData";
    readonly value: {
      /** Bech32 account address */
      signer: string;
      /** data to sign */
      data: string;
    };
}

import { gen_sk, sk_to_pk } from "@solar-republic/neutrino"


export class NonceWallet {
    private private : Uint8Array;
    private public  : Uint8Array;

    constructor() { 
        this.private = gen_sk();
        this.public = sk_to_pk(this.private);
    }

    get privateKey() {
        return this.private;
    }

    get publicKey() {
        return this.public;
    }
}