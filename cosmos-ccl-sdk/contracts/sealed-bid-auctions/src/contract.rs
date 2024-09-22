#![cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;

use cosmwasm_std::{
    ensure, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult
};


use sdk::{ENCRYPTING_WALLET, BLOCK_SIZE};
use secret_toolkit::utils::{pad_handle_result, pad_query_result};


use crate::query::{self, query_extended};
use crate::state::{AuctionItem, BidItem, ALL_BID_MAP, AUCTION_COUNT, AUCTION_MAP, BID_MAP};
use crate::error::ContractError;
use crate::msg::{InnerMethods, QueryMsg};
use crate::utils::calculate_future_block_height;
use crate::{msg::{ExecuteMsg, InstantiateMsg}, state::ADMIN};




#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    
    ADMIN.save(
        deps.storage,
        &msg.admin
        .map(|a| deps.api.addr_validate(&a))
        .transpose()?
        .unwrap_or(info.sender.clone())
    )?;

    sdk::reset_encryption_wallet(
        deps.api, deps.storage, &env.block, None, None
    )?;

    AUCTION_COUNT.save(deps.storage, &0)?;
    Ok(Response::new())
}


#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    
    let (
        msg, 
        info
    ) = sdk::handle_encrypted_wrapper(
        deps.api, deps.storage, info, msg
    )?;

    let response = match msg {

        ExecuteMsg::ResetEncryptionKey {  } => {
            let admin = ADMIN.load(deps.storage)?;
            ensure!(admin == info.sender, ContractError::Unauthorized {});
            sdk::reset_encryption_wallet(
                deps.api, deps.storage, &env.block, None, None
            )?;
            Ok(Response::default())
        },

        ExecuteMsg::Extension { msg } => {
            match msg {
                InnerMethods::CreateAuctionItem { 
                    name, 
                    description, 
                    end_time 
                } => {
                    let end_time = calculate_future_block_height(
                        env.block.height, 
                        end_time.u64()
                    );

                    let auction_item = AuctionItem {
                        name,
                        description,
                        end_time
                    };
                    
                    let auction_id = AUCTION_COUNT.load(deps.storage)? + 1;

                    AUCTION_COUNT.save(deps.storage, &auction_id)?;

                    AUCTION_MAP.insert(deps.storage, &auction_id,  &auction_item)?;
                    
                    Ok(Response::default())
                },

                InnerMethods::Bid { 
                    auction_id, 
                    amount 
                } => {
                    let auction = AUCTION_MAP.get(deps.storage, &auction_id.u64());
                    ensure!(auction.is_some(), ContractError::NotFound {});

                    let auction = auction.unwrap();
                    ensure!(env.block.height <= auction.end_time, ContractError::Expired {});

                    let auction_id = auction_id.u64();
                    let vote = BidItem { 
                        amount: amount.u128(), 
                        bidder: info.sender.to_string(),
                        auction_id 
                    };

                    BID_MAP
                        .add_suffix(&auction_id.to_be_bytes())
                        .insert(deps.storage, &info.sender.to_string(), &vote)?;
                    
                    let all_bids = match ALL_BID_MAP.get(deps.storage, &auction_id) {
                        Some(mut all_bids) => {
                            all_bids.push(vote);
                            all_bids
                        },
                        None => vec![]
                    };
                    
                    ALL_BID_MAP.insert(deps.storage, &auction_id,&all_bids)?;
                    Ok(Response::default())
                },
            }
        },
        ExecuteMsg::Encrypted { .. } => unreachable!(),
    };
    pad_handle_result(response, BLOCK_SIZE)
}




#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    let response = match msg {

        QueryMsg::EncryptionKey {} =>  to_binary(&ENCRYPTING_WALLET.load(deps.storage)?.public_key),

        QueryMsg::Extension { 
            query 
        } =>  query_extended(deps, env, query),

        _ => {
            match msg {
                QueryMsg::WithPermit { 
                    permit, 
                    hrp, 
                    query 
                } => query::query_with_permit(deps, env, permit, hrp, query),


                QueryMsg::WithAuthData { 
                    auth_data, 
                    query 
                } => query::query_with_auth_data(deps, env, auth_data, query),

                _ => unreachable!()
             }
        }
    };
    pad_query_result(response, BLOCK_SIZE)
}
