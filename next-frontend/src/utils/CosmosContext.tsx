"use client";
import { createContext, useState, useEffect, ReactNode } from "react";
// import { SecretNetworkClient } from "secretjs";
//
import { SigningStargateClient } from "@cosmjs/stargate"
import { Decimal } from "@cosmjs/math";



interface CosmosjsContextProps {
  cosmosjs: SigningStargateClient| null;
  chainId: string;
  keplrAddress: string;
  token: string;
  offlineSigner: any;
  connectWallet: (chainId?: string | string[]) => Promise<void>;
  disconnectWallet: () => void;
}

const CosmosjsContext = createContext<CosmosjsContextProps | null>(null);


interface CosmosjsContextProviderProps {
  children: ReactNode;
}

const tokenFromChainId = (chainId: string | string[]) => {
  chainId = typeof chainId === "string" ? chainId : chainId[0];

  if (chainId === "osmosis-1") {
    return "uosmo";
  } else if (chainId === "cosmoshub-4") {
    return "uatom";
  } else {
    return process.env.NEXT_PUBLIC_CONSUMER_TOKEN!;
  }
}

const rpcFromChainId = (chainId: string | string[]) => {
  chainId = typeof chainId === "string" ? chainId : chainId[0];

  if (chainId === "osmosis-1") {
    return "https://rpc.osmosis.zone:443";
  } else if (chainId === "cosmoshub-4") {
    return "https://cosmos-rpc.stakeandrelax.net:443";
  } else {
    return process.env.NEXT_PUBLIC_CONSUMER_CHAIN_ENDPOINT!;
  }
}


const CosmosjsContextProvider = ({ children }: CosmosjsContextProviderProps) => {
  const [cosmosjs, setCosmosjs] = useState<SigningStargateClient | null>(null);
  const [keplrAddress, setKeplrAddress] = useState<string>("");
  const [offlineSigner, setOfflineSigner] = useState<string>("");
  const [chainId, setChainId] = useState<string>(process.env.NEXT_PUBLIC_CONSUMER_CHAIN_ID!);

  const token = tokenFromChainId(chainId);
  /* console.log("chid:", chainId, tokenFromChainId(chainId))
  const [token, setToken] = useState<string>(tokenFromChainId(chainId)); */
  console.log("token:", token)

  useEffect(() => {
    const autoConnect = localStorage.getItem("keplrAutoConnect");
    if (autoConnect === "true") {
      connectWallet(chainId);
    }
  }, []);

  async function setupKeplr(chainId: string | string[] = process.env.NEXT_PUBLIC_CONSUMER_CHAIN_ID ?? "") {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    while (
      !(window as any).keplr ||
      !(window as any).getEnigmaUtils ||
      !(window as any).getOfflineSignerOnlyAmino
    ) {
      await sleep(50);
    }

    
    await (window as any).keplr.enable(chainId);
    (window as any).keplr.defaultOptions = {
      sign: {
        preferNoSetFee: false,
        disableBalanceCheck: true,
      },
    };

 let keplrOfflineSigner = (window as any).getOfflineSignerOnlyAmino(chainId);
    const accounts = await keplrOfflineSigner.getAccounts();
 let keplrAddress = accounts[0].address;
// console.log(keplrAddress)
  

    let consumerClient = await SigningStargateClient.connectWithSigner(
      rpcFromChainId(chainId), 
      keplrOfflineSigner,
      { gasPrice: { 
          denom:  token, 
          amount: Decimal.fromUserInput(
              process.env.NEXT_PUBLIC_CONSUMER_GAS_PRICE ?? "0.25", 
              process.env. NEXT_PUBLIC_CONSUMER_DECIMALS ? Number(process.env.NEXT_PUBLIC_CONSUMER_DECIMALS) : 6
          ) }
        }
    );
    setKeplrAddress(keplrAddress);
    setCosmosjs(consumerClient);
    setOfflineSigner(keplrOfflineSigner);
    
    const firstChainId = typeof chainId === "string" ? chainId : chainId![0];
    setChainId(firstChainId)
    //setToken(firstChainId);
    console.log(consumerClient)
  }

  async function connectWallet(chainId?: string | string[]) {
    try {
      if (!(window as any).keplr) {
        console.log("Install Keplr!");
      } else {
        await setupKeplr(chainId);
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
        chainId,
        cosmosjs,
        token,
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
