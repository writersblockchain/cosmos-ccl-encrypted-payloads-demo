"use client";

import { CosmosjsContext } from "../utils/CosmosContext";
import { useContext } from "react";
import EncryptModal from "@/components/Encrypt";
import QuerySecretModal from "@/components/QuerySecret";
import { Connector } from "@/components/Connector";
import AuctionstModal from "@/components/Auctions";

// export type AppCase = "EncryptedData" | "ConfVoting" | "SealedBids"


export const AuctionsCase = () => {

  const context = useContext(CosmosjsContext);

  if (!context) {
    return null; // Handle the case when context is null
  }

  return (
      <>
        <p className="text-xl font-bold mt-4">
            Sealed Bids Auctions
        </p>
        <h6 className="text-xs hover:underline text-brand-blue">
          <a
            href="https://docs.scrt.network/secret-network-documentation/confidential-computing-layer/ibc/storing-encrypted-data-on-secret-network"
            target="_blank"
            rel="noopener noreferrer"
          >
            [click here for docs]
          </a>
        </h6>
        <div className="mt-5 sm:mx-auto w-full sm:max-w-sm">
          <Connector />
          <AuctionstModal />
        </div>
    </>
  );
}

export default AuctionsCase;