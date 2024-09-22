
use cosmwasm_std::{
    ensure, to_binary, Binary, Deps, Env, StdError, StdResult
};

use sdk::{PERMIT_PREFIX, CosmosAuthData};
//use sdk::{session_key::{SessionKey, SessionKeyStore}, CosmosAuthData};
use secret_toolkit::permit::Permit;

use crate::{error::ContractError, msg::{ExtendedQueries, InnerQueries}, state::{AuctionItem, ALL_BID_MAP, AUCTION_MAP, BID_MAP}};
//use shared::{storage::PERMIT_PREFIX, AccoundId};



pub fn query_with_permit(
    deps        :   Deps, 
    env         :   Env, 
    permit      :   Permit,
    hrp         :   Option<String>,
    query       :   InnerQueries
) -> StdResult<Binary> {
    let address = secret_toolkit::permit::validate(
        deps, 
        PERMIT_PREFIX, 
        &permit, 
        env.contract.address.to_string(), 
        hrp.as_deref()
    )?;
    query_inner(deps, env, address, query)
}



pub fn query_with_auth_data(
    deps        :   Deps, 
    env         :   Env, 
    auth_data   :   CosmosAuthData,
    query       :   InnerQueries
) -> StdResult<Binary> {
    auth_data.verify(deps.api)?;
    auth_data.check_data(deps.storage, &env)?;
    let address = auth_data.primary_address()?;
    query_inner(deps, env,address, query)
}



pub fn query_inner(
    deps        :   Deps, 
    _env         :   Env, 
    auth_user   :   String,
    query       :   InnerQueries
) -> StdResult<Binary> {

    match query {

        InnerQueries::MyBid { auction_id } => {
            let vote = BID_MAP
                .add_suffix(&auction_id.to_be_bytes())
                .get(deps.storage, &auth_user);
            to_binary(&vote)
        },

    }
    
}



pub fn query_extended(
    deps        :   Deps, 
    env         :   Env, 
    query       :   ExtendedQueries
) -> StdResult<Binary> {

    match query {
        ExtendedQueries::Auctions {} => {
            
            let props  = AUCTION_MAP
                .iter(deps.storage)?
                .collect::<StdResult<Vec<(u64, AuctionItem)>>>()?;

            to_binary(&props)
        },

        ExtendedQueries::Auction { auction_id } => {
            let prop = AUCTION_MAP
                .get(deps.storage, &auction_id);
            to_binary(&prop)
        },


        ExtendedQueries::AllBids { auction_id } => {
            let auction = AUCTION_MAP
                .get(deps.storage, &auction_id);
            ensure!(auction.is_some(), StdError::generic_err(ContractError::NotFound {}.to_string()));

            let auction = auction.unwrap();
            ensure!(auction.end_time >= env.block.height, StdError::generic_err("Not finished yet"));
            
            let votes = ALL_BID_MAP
                .get(deps.storage, &auction_id).unwrap_or_default();
            to_binary(&votes)
        },

        ExtendedQueries::Result { auction_id } => {
            let auction = AUCTION_MAP
                .get(deps.storage, &auction_id);
            ensure!(auction.is_some(), StdError::generic_err(ContractError::NotFound {}.to_string()));

            let auction = auction.unwrap();
            ensure!(auction.end_time >= env.block.height, StdError::generic_err("Not finished yet"));

            let bids = ALL_BID_MAP
                .get(deps.storage, &auction_id).unwrap_or_default();
            
            let mut winner = None;
            let mut max = 0;
            for bid in bids {
                if bid.amount > max {
                    max = bid.amount;
                    winner = Some(bid);
                }
            }
            to_binary(&winner)
        }

    }
    
}