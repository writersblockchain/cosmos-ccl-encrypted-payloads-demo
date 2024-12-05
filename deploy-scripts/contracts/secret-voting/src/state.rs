use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, VoteOption};
use secret_toolkit::serialization::Bincode2;
use secret_toolkit::storage::iter_options::WithIter;
use secret_toolkit::{storage::Item, serialization::Json};
use secret_toolkit::storage::Keymap;

pub const ADMIN             :    Item<Addr>              =    Item::new(b"admin");

#[cw_serde]
pub struct Proposal {
    pub name: String,
    pub description: String,
    pub creator: String,
    pub end_block: u64,
}

#[cw_serde]
pub struct Vote {
    pub vote : VoteOption,
    pub proposal_id: u64,
}

pub static PROPOSAL_COUNT: Item<u64> = Item::new(b"PROPOSAL_COUNT");
pub static PROPOSAL_MAP: Keymap<u64, Proposal, Bincode2, WithIter> = Keymap::new(b"PROPOSAL_MAP");

pub static VOTE_MAP: Keymap<String, Vote, Json> = Keymap::new(b"VOTE_MAP");
pub static ALL_VOTE_MAP: Keymap<u64, Vec<Vote>, Json> = Keymap::new(b"AVOTE_MAP");
