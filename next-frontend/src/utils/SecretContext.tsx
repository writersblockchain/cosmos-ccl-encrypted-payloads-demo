"use client";
import { createContext, useState, useEffect, ReactNode } from "react";
import { SecretNetworkClient } from "secretjs";


interface SecretjsContextProps {
  secretjs: SecretNetworkClient | null;
  secretAddress: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const SecretjsContext = createContext<SecretjsContextProps | null>(null);
const SECRET_CHAIN_ID = "pulsar-3";
const SECRET_LCD = "https://lcd.testnet.secretsaturn.net";

interface SecretjsContextProviderProps {
  children: ReactNode;
}

const SecretjsContextProvider = ({ children }: SecretjsContextProviderProps) => {
  const [secretjs, setSecretjs] = useState<SecretNetworkClient | null>(null);
  const [secretAddress, setSecretAddress] = useState<string>("");

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

    await (window as any).keplr.enable(SECRET_CHAIN_ID);
    (window as any).keplr.defaultOptions = {
      sign: {
        preferNoSetFee: false,
        disableBalanceCheck: true,
      },
    };

    const keplrOfflineSigner = (window as any).getOfflineSignerOnlyAmino(SECRET_CHAIN_ID);
    const accounts = await keplrOfflineSigner.getAccounts();

    const secretAddress = accounts[0].address;

    const secretjs = new SecretNetworkClient({
      url: SECRET_LCD,
      chainId: SECRET_CHAIN_ID,
      wallet: keplrOfflineSigner,
      walletAddress: secretAddress,
      encryptionUtils: (window as any).getEnigmaUtils(SECRET_CHAIN_ID),
    });

    setSecretAddress(secretAddress);
    setSecretjs(secretjs);
  }

  async function connectWallet() {
    try {
      if (!(window as any).keplr) {
        console.log("Install Keplr!");
      } else {
        await setupKeplr();
        localStorage.setItem("keplrAutoConnect", "true");
        console.log(secretAddress);
      }
    } catch (error) {
      alert("An error occurred while connecting to the wallet. Please try again.");
    }
  }

  function disconnectWallet() {
    setSecretAddress("");
    setSecretjs(null);
    localStorage.setItem("keplrAutoConnect", "false");
    console.log("Wallet disconnected!");
  }

  return (
    <SecretjsContext.Provider
      value={{
        secretjs,
        secretAddress,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </SecretjsContext.Provider>
  );
};

export { SecretjsContext, SecretjsContextProvider };
