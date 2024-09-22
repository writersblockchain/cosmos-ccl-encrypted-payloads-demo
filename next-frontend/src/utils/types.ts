export type AppCase = "EncryptedData" | "ConfVoting" | "SealedBids"

export type Proposal = {
    proposal_id: number;
    name: string;
    description: string;
    end_time?: string;
}

export type Auction = {
    auction_id: number;
    name: string;
    description: string;
    end_time?: string;
}