"use client";

import { useContext } from "react";
import { CosmosjsContext } from "../utils/CosmosContext";
import { Connector } from "@/components/Connector";
import QuerySecretModal from "@/components/QuerySecret";
import ProposalstModal from "@/components/Proposals";

// export type AppCase = "EncryptedData" | "ConfVoting" | "SealedBids"


export const VotingCase = () => {

  const context = useContext(CosmosjsContext);
  if (!context) {
    return null; // Handle the case when context is null
  }


  return (
      <>
        <p className="text-xl font-bold mt-4">
            Confidential Voting
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
          <ProposalstModal />
        </div>
    </>
  );
}

export default VotingCase;