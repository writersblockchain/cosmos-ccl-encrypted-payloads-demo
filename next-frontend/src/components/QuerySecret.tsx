"use client";

import React, { useContext, useEffect, useState } from 'react';
import { QueryGateway } from "../functions/Gateway";
import { CosmosjsContext } from '@/utils/CosmosContext';

const QuerySecretModal = () => {

    const context = useContext(CosmosjsContext);
    const chainId = context?.chainId;
    const [valueString, setValueString] = useState('No Value');

    const { query_secret } = QueryGateway();

    const handleSubmit = (e? : React.FormEvent<HTMLFormElement>) => {
        if (e) e.preventDefault();
        query_secret()
        .then(setValueString)
    };

    // when first rendered check local storage to see if "queryPermit" exist
    // if exist call handleSubmit

    useEffect(() => {
        if (localStorage.getItem(chainId + ":queryPermit")) {
            handleSubmit();
        }
    }), [];


    return (
        <div className="flex flex-col full-height justify-start items-center lg:px-8 text-brand-orange">
            <div className="mt-4">
                <form onSubmit={handleSubmit} className="space-y-4" style={{ width: '460px' }}>
                    <div className="border-4 border-brand-orange rounded-lg p-4">
      
                        <div className="flex items-center justify-center gap-2">
                            <input
                                type="text"
                                value={valueString}
                                disabled={true}
                                onChange={(e) => setValueString(e.target.value)}
                                className="block w-full pl-2 text-brand-blue rounded-md border border-brand-orange bg-brand-tan py-1.5 shadow-sm focus:ring-2 focus:ring-brand-blue sm:text-sm"
                            />
                            <button
                                type="submit"
                                className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuerySecretModal;
