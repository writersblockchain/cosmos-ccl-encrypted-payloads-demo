use cosmwasm_schema::cw_serde;

use cosmwasm_std::{Uint128, Uint64};
use sdk::{gateway::{GatewayExecuteMsg, GatewayQueryMsg}, CosmosAuthData};


#[cw_serde]
pub struct InstantiateMsg {
    pub  admin                  :   Option<String>,
}



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



#[cw_serde]
pub enum ExtendedQueries {
    Auctions {},
    Auction { auction_id: u64 },
    AllBids { auction_id: u64 },
    Result { auction_id: u64 },
}



#[cw_serde]
pub enum InnerQueries {
    MyBid { auction_id: u64 },
}



pub type ExecuteMsg                 =   GatewayExecuteMsg<InnerMethods>;
pub type QueryMsg                   =   GatewayQueryMsg<InnerQueries, CosmosAuthData, ExtendedQueries>;