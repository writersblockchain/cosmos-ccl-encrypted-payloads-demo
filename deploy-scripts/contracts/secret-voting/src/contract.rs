use cosmwasm_std::{
    ensure, entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult,
};

use sdk::{BLOCK_SIZE, ENCRYPTING_WALLET};
use secret_toolkit::utils::{pad_handle_result, pad_query_result};

use crate::error::ContractError;
use crate::msg::{InnerMethods, QueryMsg};
use crate::query;
use crate::state::{Proposal, Vote, ALL_VOTE_MAP, PROPOSAL_COUNT, PROPOSAL_MAP, VOTE_MAP};
use crate::utils::calculate_future_block_height;
use crate::{
    msg::{ExecuteMsg, InstantiateMsg},
    state::ADMIN,
};

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
            .unwrap_or(info.sender.clone()),
    )?;

    sdk::reset_encryption_wallet(deps.api, deps.storage, &env.block, None, None)?;

    PROPOSAL_COUNT.save(deps.storage, &0)?;
    Ok(Response::new())
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    let (msg, info) = sdk::handle_encrypted_wrapper(deps.api, deps.storage, info, msg)?;

    let response = match msg {
        ExecuteMsg::ResetEncryptionKey {} => {
            let admin = ADMIN.load(deps.storage)?;
            ensure!(admin == info.sender, ContractError::Unauthorized {});
            sdk::reset_encryption_wallet(deps.api, deps.storage, &env.block, None, None)?;
            Ok(Response::default())
        }

        ExecuteMsg::Extension { msg } => match msg {
            InnerMethods::CreateProposal {
                name,
                description,
                end_time,
            } => {
                let end_block = calculate_future_block_height(env.block.height, end_time.u64());

                let proposal_id = PROPOSAL_COUNT.load(deps.storage)? + 1;

                PROPOSAL_COUNT.save(deps.storage, &proposal_id)?;

                PROPOSAL_MAP.insert(
                    deps.storage,
                    &proposal_id,
                    &Proposal {
                        name,
                        description,
                        end_block,
                        creator: info.sender.to_string(),
                    },
                )?;

                Ok(Response::default())
            }

            InnerMethods::Vote { proposal_id, vote } => {
                let proposal = PROPOSAL_MAP.get(deps.storage, &proposal_id.u64());
                ensure!(proposal.is_some(), ContractError::NotFound {});

                let proposal = proposal.unwrap();

                ensure!(
                    env.block.height <= proposal.end_block,
                    ContractError::Expired {}
                );

                let proposal_id = proposal_id.u64();
                let vote = Vote { vote, proposal_id };

                VOTE_MAP.add_suffix(&proposal_id.to_be_bytes()).insert(
                    deps.storage,
                    &info.sender.to_string(),
                    &vote,
                )?;

                let all_votes = match ALL_VOTE_MAP.get(deps.storage, &proposal_id) {
                    Some(mut all_votes) => {
                        all_votes.push(vote);
                        all_votes
                    }
                    None => vec![],
                };

                ALL_VOTE_MAP.insert(deps.storage, &proposal_id, &all_votes)?;
                Ok(Response::default())
            }
        },
        ExecuteMsg::Encrypted { .. } => unreachable!(),
    };
    pad_handle_result(response, BLOCK_SIZE)
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    let response = match msg {
        QueryMsg::EncryptionKey {} => to_binary(&ENCRYPTING_WALLET.load(deps.storage)?.public_key),

        QueryMsg::Extension { query } => query::query_extended(deps, env, query),

        _ => match msg {
            QueryMsg::WithPermit { permit, hrp, query } => {
                query::query_with_permit(deps, env, permit, hrp, query)
            }

            QueryMsg::WithAuthData { auth_data, query } => {
                query::query_with_auth_data(deps, env, auth_data, query)
            }

            _ => unreachable!(),
        },
    };
    pad_query_result(response, BLOCK_SIZE)
}
