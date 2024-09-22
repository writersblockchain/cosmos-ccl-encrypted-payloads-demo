
use cosmwasm_std::{
    ensure, to_binary, Binary, Deps, Env, StdError, StdResult
};

use sdk::{PERMIT_PREFIX, CosmosAuthData};
//use sdk::{session_key::{SessionKey, SessionKeyStore}, CosmosAuthData};
use secret_toolkit::permit::Permit;

use crate::{msg::{ExtendedQueries, InnerQueries}, state::{Proposal, ALL_VOTE_MAP, PROPOSAL_MAP, VOTE_MAP}};
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
    _env        :   Env, 
    auth_user   :   String,
    query       :   InnerQueries
) -> StdResult<Binary> {

    match query {

        InnerQueries::MyVote { proposal_id } => {
            let vote = VOTE_MAP
                .add_suffix(&proposal_id.to_be_bytes())
                .get(deps.storage, &auth_user);
            to_binary(&vote)
        }

    }
    
}


pub fn query_extended(
    deps        :   Deps, 
    env         :   Env, 
    query       :   ExtendedQueries
) -> StdResult<Binary> {
    match query {
        ExtendedQueries::Proposals {} => {
            let props  = PROPOSAL_MAP
                .iter(deps.storage)?
                .collect::<StdResult<Vec<(u64, Proposal)>>>()?;
            to_binary(&props)
        },
        ExtendedQueries::Proposal { proposal_id } => {
            let prop = PROPOSAL_MAP
                .get(deps.storage, &proposal_id);
            to_binary(&prop)
        },
        ExtendedQueries::AllVotes { proposal_id } => {

            let prop = PROPOSAL_MAP
                .get(deps.storage, &proposal_id);

            if prop.is_none() {
                return to_binary(&Vec::<String>::new());
            }

            let prop = prop.unwrap();
            ensure!(prop.end_time > env.block.time.seconds(), StdError::generic_err("Can't see votes for ongoing propsoal"));

            let votes = ALL_VOTE_MAP
                .get(deps.storage, &proposal_id).unwrap_or_default();
            to_binary(&votes)
        }
    }
}