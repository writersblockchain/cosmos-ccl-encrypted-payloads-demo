# CCL-SDK Demos

This repository contains a collection of demos for the CCL-SDK. The demos are built using Next.js and are intended to showcase the capabilities of the SDK


## Secret Voting

To use the power of CCL-SDL the contract is extending existing messages exposed by the SDK that implements `WithEncryption` trait. An alternative is to define your completely custom message and implement the trait yourself. This allows us to use `sdk::handle_encrypted_wrapper` method to handle the encryption/decryption logic for us.

```rust

In case of our transactional actions me define our `ExecuteMsg` as follows:

```rust
#[cw_serde]
pub enum InnerMethods {
    CreateProposal {
        name: String,
        description: String,
        end_time: Uint64
    },

    Vote {
        proposal_id: Uint64,
        vote: VoteOption
    },
}

pub type ExecuteMsg   =   GatewayExecuteMsg<InnerMethods>;
```
Which translates to:
    
```rust
#[cw_serde]
pub enum ExecuteMsg {

    Encrypted {
        payload             :   Binary,
        payload_signature   :   Binary,
        payload_hash        :   Binary,
        user_key            :   Binary,
        nonce               :   Binary,
    }

    ResetEncryptionKey  { },

    Extension {
        msg: {
            CreateProposal { ... }   /   Vote { ... },   
        }
    }
}
```

In case of queries the the SDK allows us to customise both inner queries that requre authenticatino + encryption but also the queries that are public:


```rust
#[cw_serde]
pub enum ExtendedQueries {
    Proposals {},
    Proposal { proposal_id: u64 },
    AllVotes { proposal_id: u64 },
}

#[cw_serde]
pub enum InnerQueries {
    MyVote { proposal_id: u64 },
}

pub type QueryMsg   =   GatewayQueryMsg<InnerQueries, sdk::CosmosAuthData, ExtendedQueries>;
```

Which translates to:

```rust
#[cw_serde]
pub enum QueryMsg {
    EncryptionKey  {},

    WithAuthData {
        auth_data    :   sdk::CosmosAuthData,
        query        :   { MyVote { proposal_id: u64 } }
    },

    WithPermit {
        permit       :   secret_toolkit::permit::Permit,
        hrp          :   Option<String>,
        query        :   { MyVote { proposal_id: u64 } }
    },

    Extension {
        query        :  { Proposals {}  /  Proposal { proposal_id: u64 }  /  AllVotes { proposal_id: u64 }  }
    }
}
```


## Sealed Bid Auctions

The messages for sealed bid auctions follow the identical logic as the secret voting. The only difference is that the `InnerMethods` and `InnerQueries` and `ExtendedQueries` are different. E.g:

```rust
#[cw_serde]
pub enum InnerMethods {
    CreateAuctionItem {
        name: String,
        description: String,
        end_time: Uint64
    },

    Bid {
        auction_id: Uint64,
        amount: Uint128
    },
}

pub type ExecuteMsg  =   GatewayExecuteMsg<InnerMethods>;
```

[Note:] This is a minimal contract showcasing executing custom messages in private manner and not suited for production. At the moment the contract doesn't take into account the the actual funds sent alongside ics20 packets for bidding not has logic for releasing the funds



## MextJS

The NextJS project has hardcoded configuration for deployed contracts and chain specific details like RPC addresses and token information. To customise them proceed to [`config.ts`](/next-frontend/src/ccl-sdk/config.ts) taking a look at `loadContractMultiConfig` and `loadIbcConfig` functions.  Another file to look at is [`CosmosContext.tsx`](/next-frontend/src/utils/CosmosContext.tsx) and functions like `rpcFromChainId` and `tokenFromChainId`