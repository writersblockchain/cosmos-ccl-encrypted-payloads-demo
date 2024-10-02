export type AppCase = "EncryptedData" | "ConfVoting" | "SealedBids"

export type Proposal = {
    proposal_id: number;
    name: string;
    description: string;
    end_block: number;
}

/* 
pub amount: u128,
pub auction_id: u64,
pub bidder: String,
 */

export type Bid = {
    amount: string;
    auction_id: number;
    bidder: string;
}


export type Auction = {
    auction_id: number;
    name: string;
    description: string;
    end_block: number;
    result?: Bid
}