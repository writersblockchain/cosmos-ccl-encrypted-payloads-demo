"use client";

import { WalletIcon } from "@heroicons/react/24/outline";
import { SecretjsContext } from "../utils/SecretContext";
import { useContext } from "react";
import EncryptModal from "@/components/Encrypt";
import Image from "next/image";

export default function Home() {
  const context = useContext(SecretjsContext);

  if (!context) {
    return null; // Handle the case when context is null
  }

  const { connectWallet } = context;

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
