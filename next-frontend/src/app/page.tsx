"use client";

import { WalletIcon } from "@heroicons/react/24/outline";
import { CosmosjsContext } from "../utils/CosmosContext";
import { useContext } from "react";
import EncryptModal from "@/components/Encrypt";
import Image from "next/image";
import { useEffect } from "react";
import { SigningStargateClient } from "@cosmjs/stargate"
import { Decimal } from "@cosmjs/math";
import QueryModal from "@/components/Query";

export default function Home() {
  const context = useContext(CosmosjsContext);

  if (!context) {
    return null; // Handle the case when context is null
  }

  const { connectWallet, chainId } = context;

  const resetKeplr = async (newChainId: string) => {
    if (chainId !== newChainId) {
      await connectWallet(newChainId);
    }
  }

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
        <div className="mt-3 sm:mx-auto w-full sm:max-w-sm">
          <div className="flex gap-5 justify-end -mr-9 ml-12"> {/* Adjusted margin here */}

            <div
              className=" text-brand-orange hover:text-brand-blue wallet-icon"
            >
              {/* write a select input with osmosis-1 as default option and cosmoshub-4 as second */}
              <select 
                className="border-2 border-brand-orange rounded-lg p-2" 
                onChange={(e) => resetKeplr(e.target.value)}
              >
                <option value="osmosis-1">osmosis-1</option>
                <option value="cosmoshub-4">cosmoshub-4</option>
              </select>
            </div>

            <WalletIcon
              onClick={() => connectWallet(chainId)}
              className="h-10 w-10 text-brand-orange hover:text-brand-blue wallet-icon"
            />
          </div>
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
    </>
  );
}
