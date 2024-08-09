"use client";

import { WalletIcon } from "@heroicons/react/24/outline";
import { CosmosjsContext } from "../utils/CosmosContext";
import { useContext } from "react";
import EncryptModal from "@/components/Encrypt";
import Image from "next/image";
import { useEffect } from "react";
import { SigningStargateClient } from "@cosmjs/stargate"
import { Decimal } from "@cosmjs/math";

export default function Home() {
  const context = useContext(CosmosjsContext);

  if (!context) {
    return null; // Handle the case when context is null
  }

  const { connectWallet } = context;

//   async function setupKeplr() {
//     const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

//     while (
//       !(window as any).keplr ||
//       !(window as any).getEnigmaUtils ||
//       !(window as any).getOfflineSignerOnlyAmino
//     ) {
//       await sleep(50);
//     }

//     await (window as any).keplr.enable(process.env.NEXT_PUBLIC_CONSUMER_CHAIN_ID);
//     (window as any).keplr.defaultOptions = {
//       sign: {
//         preferNoSetFee: false,
//         disableBalanceCheck: true,
//       },
//     };

//     const keplrOfflineSigner = (window as any).getOfflineSignerOnlyAmino(process.env.NEXT_PUBLIC_CONSUMER_CHAIN_ID);
//     const accounts = await keplrOfflineSigner.getAccounts();
// const keplrAddress = accounts[0].address;
// console.log(keplrAddress)

//     let consumerClient = await SigningStargateClient.connectWithSigner(
//       process.env.NEXT_PUBLIC_CONSUMER_CHAIN_ENDPOINT!, 
//       keplrOfflineSigner,
//       { gasPrice: { 
//           denom:  process.env.NEXT_PUBLIC_CONSUMER_TOKEN!, 
//           amount: Decimal.fromUserInput(
//               process.env.NEXT_PUBLIC_CONSUMER_GAS_PRICE ?? "0.25", 
//               process.env. NEXT_PUBLIC_CONSUMER_DECIMALS ? Number(process.env.NEXT_PUBLIC_CONSUMER_DECIMALS) : 6
//           ) }
//         });
//      console.log(consumerClient)
//   }
//   setupKeplr()

  return (
    <>
      <div className="flex flex-col items-center px-6 py-12 lg:px-8 bg-brand-tan text-brand-orange min-h-screen">
        <p className="text-xl font-bold mt-4">Cross-Chain IBC Encryption Demo</p>
        <h6 className="text-xs hover:underline text-brand-blue">
          <a
            href="https://docs.scrt.network/secret-network-documentation/confidential-computing-layer/ibc/storing-encrypted-data-on-secret-network"
            target="_blank"
            rel="noopener noreferrer"
          >
            [click here for docs]
          </a>
        </h6>
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex justify-end -mr-9 ml-12"> {/* Adjusted margin here */}
            <WalletIcon
              onClick={connectWallet}
              className="h-10 w-10 text-brand-orange hover:text-brand-blue wallet-icon"
            />
          </div>
          <EncryptModal />
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
    </>
  );
}
