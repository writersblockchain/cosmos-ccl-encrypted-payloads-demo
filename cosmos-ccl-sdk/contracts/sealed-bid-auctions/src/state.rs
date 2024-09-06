use cosmwasm_schema::cw_serde;
use cosmwasm_std::Addr;
use secret_toolkit::storage::Item;
use secret_toolkit::storage::Keymap;



pub static ADMIN             :    Item<Addr>              =    Item::new(b"admin");
pub static AUCTION_MAP: Keymap<u64, AuctionItem> = Keymap::new(b"AUCTION_MAP");


pub static AUCTION_COUNT: Item<u64> = Item::new(b"ACOUNT");
pub static BID_MAP: Keymap<String, BidItem> = Keymap::new(b"BID_MAP");
pub static ALL_BID_MAP: Keymap<u64, Vec<BidItem>> = Keymap::new(b"ABID_MAP");



#[cw_serde]
pub struct AuctionItem {
    pub name: String,
    pub description: String,
    pub end_time: u64,
}


#[cw_serde]
pub struct BidItem {
    pub amount: u128,
    pub auction_id: u64,
    pub bidder: String,
}

#[cw_serde]
pub struct AuctionBids {
    pub bids: Vec<BidItem>,
}