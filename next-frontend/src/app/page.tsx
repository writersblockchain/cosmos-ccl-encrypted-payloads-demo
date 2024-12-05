"use client";

import { useContext, useState } from "react";
import { CosmosjsContext } from "../utils/CosmosContext";
import { useEffect } from "react";
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
    let newTitle = ""
    if (appCase == "EncryptedData") {
      newTitle = "Cross-Chain IBC Encryption Demo"
    }  else if (appCase == "ConfVoting") {
      newTitle = "Confidential Voting"
    } else if (appCase == "SealedBids") {
      newTitle = "Sealed Bids Auctions"
    }

    if (title != newTitle) {
      setTitle(newTitle)
    }
  }, [appCase])


  if (!context) {
    return null; // Handle the case when context is null
  }

  // export type AppCase = "EncryptedData" | "ConfVoting" | "SealedBids"
  return (
    <div className="flex justify-center bg-brand-tan text-brand-orange min-h-screen py-12 lg:px-8 relative ">
      <CaseMenu appCase={appCase} setAppCase={setCase} />

      <div className="flex flex-col items-center ">

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
