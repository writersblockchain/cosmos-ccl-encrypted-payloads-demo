import React, { useContext, useEffect, useState } from 'react';
import { ExecuteGateway, QueryGateway } from "../functions/Gateway";
import { Auction } from '@/utils/types';
import { CosmosjsContext } from '@/utils/CosmosContext';
import { secretClient } from '@/ccl-sdk/clients';

const AuctionstModal = () => {
    const context = useContext(CosmosjsContext);

    let keplrAddress = context?.keplrAddress;
    let chainId = context?.chainId;
  
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
    const [amount, setAmount] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [existingBid, setExistingBid] = useState<string | null>(null);
    const [auctions, setAuctions] = useState<Auction[]>([]);

    const [secretBlock, setSecretBlock] = useState<{ height: number, time: string}>({ height: 0, time: "" });

    const { create_auction, bid_auction } = ExecuteGateway();
    const { query_auctions, query_my_bid, query_auction_result } = QueryGateway();

    // Fetch proposals
    useEffect(() => {
        setSelectedAuction(null);

        secretClient.query.tendermint.getLatestBlock({ })
        .then((data) => {
            setSecretBlock({
                height: Number(data.block?.header?.height ?? ""),
                time: (data.block?.header?.time as string) ?? ""
            });
        })

        query_auctions()
        .then((data) => {
            console.log('query all auctions data', data);
            if (data && Array.isArray(data)) {
                setAuctions(data.map(([id, p]: [number, Auction]) => ({ ...p, auction_id: id })));
            } else {
                setAuctions([]);
            }
            data.forEach(([id, p]: [number, Auction]) => {
                query_auction_result(id)
                .then((data) => {
                    console.log('query auction result data', data);
                })
                .catch((e) => {
                    console.error(e);
                });
            });
        })
        .catch((e) => {
            setAuctions([]);
            console.error(e);
        });

    }, [chainId, keplrAddress]);


    // Fetch user's bud
    useEffect(() => {
        setExistingBid(null);
        if (selectedAuction?.auction_id) {
            query_my_bid(selectedAuction.auction_id)
            .then((data) => {
                console.log("bid data:", data)
                if (data && typeof data === "object" && "amount" in data) {
                    setExistingBid(data.amount);
                }
            });
        }
    }, [keplrAddress, selectedAuction]);

    
    // reset bids on proposal change
    useEffect(() => {
        setAmount("");
    }, [selectedAuction]);



    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        console.log('creating auction', title, description);
        create_auction(title, description)
        .then(() => {
            setTitle('');
            setDescription('');
        })
        .catch((e) => console.error(e))
        .finally(() => {
            setSubmitting(false);
        });
    };

    const handleBid = (amount: string) => {
        setSubmitting(true);
        bid_auction(selectedAuction!.auction_id!.toString(), amount)
        .then(() => {
            setAmount("");
        })
        .finally(() => setSubmitting(false));
    }

    return (
        <div className="flex flex-col full-height justify-start items-center lg:px-8 text-brand-orange">
            <div className="mt-4">

                { auctions.length > 0 && (
                    <div className='border-4 border-brand-orange rounded-lg p-4 mt-2 mb-5'>
                        <h5 className="font-bold">Auctions</h5>

                        <div className="flex flex-col space-y-2 mt-2 gap-2">
                            {auctions.map((auction, index) => (
                                <button 
                                    key={index} 
                                    disabled={auction === selectedAuction}
                                    onClick={() => setSelectedAuction(auction)}
                                    className="flex flex-col  border-2 rounded-lg p-2 border-brand-orange hover:border-brand-blue hover:text-brand-blue disabled:border-red-200 disabled:text-red-200"
                                >
                                    <div className='flex justify-between w-full'>
                                        <h6 className="font-bold">{auction.name}</h6>
                                        {/* { secretBlock.height && secretBlock.time && (
                                            <span className="text-sm">Ends at: {secretBlock.height - auction.end_block} blocks</span>
                                        )} */}
                                    </div>
                                    <p>{auction.description}</p>
                                </button>
                            ))}
                        </div>
                        


                        <div className='my-4 flex gap-2 justify-center items-center'>
                            <label className="block text-sm font-medium leading-6 w-full">
                                Amount to Bid
                            </label>
                            <input
                                type="text"
                                value={amount}
                                disabled={!selectedAuction}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className="mt-2 block w-full pl-2 text-brand-blue rounded-md border border-brand-orange bg-brand-tan py-1.5 shadow-sm focus:ring-2 focus:ring-brand-blue sm:text-sm"
                            />
                        </div> 

                        {amount && (
                            <div className="my-2 flex justify-center">
                                <button
                                    disabled={submitting || !amount}
                                    onClick={() => handleBid(amount)}
                                    className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Bid
                                </button>
                            </div>
                        )}

                        {existingBid && (
                            <div className="my-2 flex justify-center text-brand-orange">
                                You have already bidded: {existingBid}
                            </div>
                        )}

                    </div>
                )}


                <form onSubmit={handleCreate} className="space-y-4" style={{ width: '460px' }}>
                    <div className="border-4 border-brand-orange rounded-lg p-4">
                        <div>
                            <label className="block text-sm font-medium leading-6 w-full">
                                Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter name of the auction item"
                                required
                                className="mt-2 block w-full pl-2 text-brand-blue rounded-md border border-brand-orange bg-brand-tan py-1.5 shadow-sm focus:ring-2 focus:ring-brand-blue sm:text-sm"
                            />
                        </div>
                        <div className='my-2'>
                            <label className="block text-sm font-medium leading-6 w-full">
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Write a description of the proposal"
                                required
                                className="mt-2 block w-full pl-2 text-brand-blue rounded-md border border-brand-orange bg-brand-tan py-1.5 shadow-sm focus:ring-2 focus:ring-brand-blue sm:text-sm"
                            />
                        </div>
                        <div className="flex justify-center mt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Create Auction
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuctionstModal;
