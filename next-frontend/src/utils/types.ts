export type AppCase = "EncryptedData" | "ConfVoting" | "SealedBids"

export type Proposal = {
    proposal_id: number;
    name: string;
    description: string;
    end_block?: string;
}

export type Auction = {
    auction_id: number;
    name: string;
    description: string;
    end_block?: string;
}