
use cosmwasm_std::{
    to_binary, Binary, Deps, Env, StdResult
};

use sdk::{common::PERMIT_PREFIX, CosmosAuthData};
//use sdk::{session_key::{SessionKey, SessionKeyStore}, CosmosAuthData};
use secret_toolkit::permit::Permit;

use crate::{msg::InnerQueries, state::{Proposal, ALL_VOTE_MAP, PROPOSAL_MAP, VOTE_MAP}};
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
    let address = auth_data.primary_address(deps.api)?;
    query_inner(deps, env,address, query)
}



pub fn query_inner(
    deps        :   Deps, 
    _env        :   Env, 
    auth_user   :   String,
    query       :   InnerQueries
) -> StdResult<Binary> {

    match query {
        InnerQueries::Proposals {} => {
            
            let props  = PROPOSAL_MAP
                .iter(deps.storage)?
                .map(|p| Ok(p?.1))
                .collect::<StdResult<Vec<Proposal>>>()?;
                

            to_binary(&props)
        },

        InnerQueries::Proposal { proposal_id} => {
            let prop = PROPOSAL_MAP
                .get(deps.storage, &proposal_id);
            to_binary(&prop)
        },

        InnerQueries::AllVotes { proposal_id } => {
            let votes = ALL_VOTE_MAP
                .get(deps.storage, &proposal_id).unwrap_or_default();
            to_binary(&votes)
        },

        InnerQueries::MyVote { proposal_id } => {
            let vote = VOTE_MAP
                .add_suffix(&proposal_id.to_be_bytes())
                .get(deps.storage, &auth_user);
            to_binary(&vote)
        }

    }
    
}