import React, { useEffect, useState } from 'react';
import { ExecuteGateway } from "../functions/Gateway";
import { loadContractMultiConfig } from '@/ccl-sdk/config';
import { getGatewayEncryptionKey } from '@/ccl-sdk/gateway';

const EncryptModal = () => {
    const [inputString, setInputString] = useState('');
    const contract = loadContractMultiConfig().secrets;
    const [encryptionKey, setEncryptionKey] = useState<string>("");
    const { store_secret } = ExecuteGateway();

    useEffect(() => {
        const fetchEncryptionKey = async () => {
            const key = await getGatewayEncryptionKey(contract);
            setEncryptionKey(key);
        };
        fetchEncryptionKey();
    }, [contract]);


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        store_secret(inputString, encryptionKey);
    };

    return (
        <div className="flex flex-col full-height justify-start items-center lg:px-8 text-brand-orange">
            <div className="mt-4">
                <form onSubmit={handleSubmit} className="space-y-4" style={{ width: '460px' }}>
                    <div className="border-4 border-brand-orange rounded-lg p-4">
                        <div>
                            <label className="block text-sm font-medium leading-6 w-full">
                                String to Encrypt
                            </label>
                            <input
                                type="text"
                                value={inputString}
                                onChange={(e) => setInputString(e.target.value)}
                                placeholder="Enter the string to encrypt"
                                required
                                className="mt-2 block w-full pl-2 text-brand-blue rounded-md border border-brand-orange bg-brand-tan py-1.5 shadow-sm focus:ring-2 focus:ring-brand-blue sm:text-sm"
                            />
                        </div>
                        <div className="flex justify-center mt-4">
                            <button
                                type="submit"
                                className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Encrypt String
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EncryptModal;
