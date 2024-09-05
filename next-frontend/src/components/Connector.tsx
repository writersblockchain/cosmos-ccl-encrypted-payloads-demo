"use client";

import { WalletIcon } from "@heroicons/react/24/outline";
import { CosmosjsContext } from "../utils/CosmosContext";
import { useContext } from "react";



export const Connector = () => {
    const context = useContext(CosmosjsContext);
    const { connectWallet, chainId } = context!;

    const resetKeplr = async (newChainId: string) => {
      if (chainId !== newChainId) {
        await connectWallet(newChainId);
      }
    }

    return (
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
    );

}