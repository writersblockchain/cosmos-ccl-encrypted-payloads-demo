"use client";
import { createContext, useState, useEffect, ReactNode } from "react";
// import { SecretNetworkClient } from "secretjs";
//
import { SigningStargateClient } from "@cosmjs/stargate"
import { Decimal } from "@cosmjs/math";



interface CosmosjsContextProps {
  cosmosjs: SigningStargateClient| null;
  keplrAddress: string;
  offlineSigner: any;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const CosmosjsContext = createContext<CosmosjsContextProps | null>(null);

const OSMOSIS_CHAIN_ID = "osmosis-1";
// const OSMOSIS_LCD = "https://rpc.osmosis.zone:443";

interface CosmosjsContextProviderProps {
  children: ReactNode;
}

const CosmosjsContextProvider = ({ children }: CosmosjsContextProviderProps) => {
  const [cosmosjs, setCosmosjs] = useState<SigningStargateClient | null>(null);
  const [keplrAddress, setKeplrAddress] = useState<string>("");
  const [offlineSigner, setOfflineSigner] = useState<string>("");

  useEffect(() => {
    const autoConnect = localStorage.getItem("keplrAutoConnect");
    if (autoConnect === "true") {
      connectWallet();

    }
  }, []);

  async function setupKeplr() {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    while (
      !(window as any).keplr ||
      !(window as any).getEnigmaUtils ||
      !(window as any).getOfflineSignerOnlyAmino
    ) {
      await sleep(50);
    }

    await (window as any).keplr.enable(process.env.NEXT_PUBLIC_CONSUMER_CHAIN_ID);
    (window as any).keplr.defaultOptions = {
      sign: {
        preferNoSetFee: false,
        disableBalanceCheck: true,
      },
    };

 let keplrOfflineSigner = (window as any).getOfflineSignerOnlyAmino(process.env.NEXT_PUBLIC_CONSUMER_CHAIN_ID);
    const accounts = await keplrOfflineSigner.getAccounts();
 let keplrAddress = accounts[0].address;
 let account = accounts[0];
// console.log(keplrAddress)

    let consumerClient = await SigningStargateClient.connectWithSigner(
      process.env.NEXT_PUBLIC_CONSUMER_CHAIN_ENDPOINT!, 
      keplrOfflineSigner,
      { gasPrice: { 
          denom:  process.env.NEXT_PUBLIC_CONSUMER_TOKEN!, 
          amount: Decimal.fromUserInput(
              process.env.NEXT_PUBLIC_CONSUMER_GAS_PRICE ?? "0.25", 
              process.env. NEXT_PUBLIC_CONSUMER_DECIMALS ? Number(process.env.NEXT_PUBLIC_CONSUMER_DECIMALS) : 6
          ) }
        });
    setKeplrAddress(keplrAddress);
    setCosmosjs(consumerClient);
    setOfflineSigner(keplrOfflineSigner);
    console.log(consumerClient)
  }

  async function connectWallet() {
    try {
      if (!(window as any).keplr) {
        console.log("Install Keplr!");
      } else {
        await setupKeplr();
        localStorage.setItem("keplrAutoConnect", "true");
        console.log(keplrAddress);
      }
    } catch (error) {
      alert("An error occurred while connecting to the wallet. Please try again.");
    }
  }

  function disconnectWallet() {
    setKeplrAddress("");
    setCosmosjs(null);
    localStorage.setItem("keplrAutoConnect", "false");
    console.log("Wallet disconnected!");
  }

  return (
    <CosmosjsContext.Provider
      value={{
        cosmosjs,
        keplrAddress,
        offlineSigner,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </CosmosjsContext.Provider>
  );
};

export { CosmosjsContext, CosmosjsContextProvider };
