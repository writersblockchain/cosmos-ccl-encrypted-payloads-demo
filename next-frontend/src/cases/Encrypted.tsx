"use client";

import { CosmosjsContext } from "../utils/CosmosContext";
import { useContext } from "react";
import EncryptModal from "@/components/Encrypt";
import Image from "next/image";
import QueryModal from "@/components/Query";
import { Connector } from "@/components/Connector";

// export type AppCase = "EncryptedData" | "ConfVoting" | "SealedBids"


export const EncryptionCase = () => {

  const context = useContext(CosmosjsContext);
  if (!context) {
    return null; // Handle the case when context is null
  }


  return (
      <div className="flex flex-col items-center ">
        <p className="text-xl font-bold mt-4">
            Cross-Chain IBC Encryption Demo
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
          <EncryptModal />
          <QueryModal />
        </div>
        <div className="flex justify-center transform scale-50 mt-4">
          <Image
            src="/secret-logo.png"
            alt="Description of my image"
            width={150} // Desired width in pixels
            height={150} // Desired height in pixels
          />
        </div>
    </div>
  );
}

export default EncryptionCase;