use cosmwasm_schema::cw_serde;

use cosmwasm_std::{Uint64, VoteOption};
use sdk::{gateway::{GatewayExecuteMsg, GatewayQueryMsg}, CosmosAuthData};


#[cw_serde]
pub struct InstantiateMsg {
    pub  admin                  :   Option<String>,
}



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



pub type ExecuteMsg                 =   GatewayExecuteMsg<InnerMethods>;
pub type QueryMsg                   =   GatewayQueryMsg<InnerQueries, CosmosAuthData, ExtendedQueries>;