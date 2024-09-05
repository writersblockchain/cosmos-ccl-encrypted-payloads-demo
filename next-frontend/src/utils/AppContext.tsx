"use client";
import { createContext, useState, ReactNode } from "react";


interface AppContextProps {
    app: App;
    setApp: (app: App) => void;
}

const AppContect = createContext<AppContextProps | null>(null);


export type App = "EncryptedData" | "ConfVoting" | "SealedBids"

interface CosmosjsContextProviderProps {
  children: ReactNode;
}


const AppContextProvider = ({ children }: CosmosjsContextProviderProps) => {
  const [app, setApp] = useState<App>("EncryptedData");

  return (
    <AppContect.Provider
      value={{app, setApp}}
    >
      {children}
    </AppContect.Provider>
  );
};

export { AppContect as CosmosjsContext, AppContextProvider as CosmosjsContextProvider };
