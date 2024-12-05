"use client";

import { useContext, useState, useEffect } from "react";
import { CosmosjsContext } from "../utils/CosmosContext";
import { AppCase } from "@/utils/types";
import Image from "next/image";
import CaseMenu from "@/components/CaseMenu";
import EncryptionCase from "@/cases/Encrypted";
import VotingCase from "@/cases/Voting";
import AuctionsCase from "@/cases/Auctions";

export default function Home() {
  const context = useContext(CosmosjsContext);
  const [appCase, setCase] = useState<AppCase>("EncryptedData");
  const [title, setTitle] = useState<string>("Cross-Chain IBC Encryption Demo");

  useEffect(() => {
    let newTitle = "";
    if (appCase === "EncryptedData") {
      newTitle = "Cross-Chain IBC Encryption Demo";
    } else if (appCase === "ConfVoting") {
      newTitle = "Confidential Voting";
    } else if (appCase === "SealedBids") {
      newTitle = "Sealed Bids Auctions";
    }

    // Only update the title if it has changed
    if (title !== newTitle) {
      setTitle(newTitle);
    }
  }, [appCase, title]); // Ensure title is a dependency to prevent unnecessary updates

  if (!context) {
    return <div>Loading...</div>; // Provide loading state until context is ready
  }

  return (
    <div className="flex justify-center bg-brand-tan text-brand-orange min-h-screen py-12 lg:px-8 relative ">
      <CaseMenu appCase={appCase} setAppCase={setCase} />

      <div className="flex flex-col items-center">
        { appCase == "EncryptedData" ? <EncryptionCase /> : <></> }
        { appCase == "ConfVoting" ? <VotingCase /> : <></> }
        { appCase == "SealedBids" ? <AuctionsCase /> : <></> }

        <div className="flex justify-center transform scale-50 mt-4">
          <Image
            src="/secret-logo.png"
            alt="Description of my image"
            width={150} // Desired width in pixels
            height={150} // Desired height in pixels
          />
        </div>
      </div>
    </div>
  );
}
