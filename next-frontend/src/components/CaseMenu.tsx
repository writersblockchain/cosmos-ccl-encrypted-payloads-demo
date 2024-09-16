import React, { useContext, useEffect, useState } from 'react';
import { QueryGateway } from "../functions/Gateway";
import { CosmosjsContext } from '@/utils/CosmosContext';
import { AppCase } from '@/utils/types';


// export type AppCase = "EncryptedData" | "ConfVoting" | "SealedBids"


interface CaseMenuProps {
    appCase: AppCase;
    setAppCase: (appCase: AppCase) => void;
}


const CaseMenu = ({ appCase, setAppCase} : CaseMenuProps ) => {
    
    return (
        <div className="flex flex-col full-height justify-start items-stretch gap-2 lg:px-8 text-brand-orange top-8 left-4 absolute">
               <button
                    type="button"
                    disabled={appCase === "EncryptedData"}
                    className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-red-200"
                    onClick={() => setAppCase("EncryptedData")}
                >
                    Cross-Chain IBC Encryption Demo

                </button> 

               <button
                    type='button'
                    disabled={appCase === "ConfVoting"}
                    className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-red-200"
                    onClick={() => setAppCase("ConfVoting")}
                >
                    Confidential Voting
                </button>

                <button
                    type='button'
                    disabled={appCase === "SealedBids"}
                    className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-red-200"
                    onClick={() => setAppCase("SealedBids")}
                >
                    Sealed Bids Auctions
                </button>
        </div>
    );
};

export default CaseMenu;
