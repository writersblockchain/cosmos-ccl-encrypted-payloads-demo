"use client";

import { WalletIcon } from "@heroicons/react/24/outline";
import { CosmosjsContext } from "../utils/CosmosContext";
import { useContext, useState } from "react";
import EncryptModal from "@/components/Encrypt";
import Image from "next/image";
import { useEffect } from "react";
import { SigningStargateClient } from "@cosmjs/stargate"
import { Decimal } from "@cosmjs/math";
import QueryModal from "@/components/Query";
import { AppCase } from "@/utils/types";
import CaseMenu from "@/components/CaseMenu";
import { Connector } from "@/components/Connector";
import EncryptionCase from "@/cases/Encrypted";


// export type AppCase = "EncryptedData" | "ConfVoting" | "SealedBids"


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



  return (
    <div className="flex justify-center bg-brand-tan text-brand-orange min-h-screen py-12 lg:px-8 relative ">
      <CaseMenu appCase={appCase} setAppCase={setCase} />

      { appCase == "EncryptedData" ? <EncryptionCase /> : <></> }
    </div>
  );
}
