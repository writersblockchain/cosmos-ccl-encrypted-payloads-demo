"use client";

import React, { useContext, useEffect, useState } from 'react';
import { ExecuteGateway, QueryGateway } from "../functions/Gateway";
import { Proposal } from '@/utils/types';
import { CosmosjsContext } from '@/utils/CosmosContext';
import { secretClient } from '@/ccl-sdk/clients';

const ProposalstModal = () => {
    const context = useContext(CosmosjsContext);

    let keplrAddress = context?.keplrAddress;
    let chainId = context?.chainId;
  
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [endTime, setEndTime] = useState<string | number>();

    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [selectedVote, setSelectedVote] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [existingVote, setExistingVote] = useState<string | null>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    
    const [secretBlock, setSecretBlock] = useState<{ height: number, time: string}>({ height: 0, time: "" });

    const { create_proposal, vote_proposal } = ExecuteGateway();
    const { query_proposals, query_my_vote } = QueryGateway();


    // Fetch proposals
    useEffect(() => {
        setSelectedProposal(null);

        query_proposals()
        .then((data) => {
            console.log('query props data', data);
            if (data && Array.isArray(data)) {
                setProposals(data.map(([id, p]: [number, Proposal]) => ({ ...p, proposal_id: id })));
            } else {
                setProposals([]);
            }
        }).catch((e) => {
            console.log(e);
            setProposals([]);
        })

        secretClient.query.tendermint.getLatestBlock({ })
        .then((data) => {
            console.log('latest props block', data);
            setSecretBlock({
                height: Number(data.block?.header?.height ?? ""),
                time: (data.block?.header?.time as string) ?? ""
            });
        })

    }, [chainId, keplrAddress]);

    // Fetch user's vote
    useEffect(() => {
        setSelectedVote(null);
        
        if (selectedProposal && selectedProposal.proposal_id) {
            query_my_vote(selectedProposal.proposal_id)
            .then((data) => {
                console.log("vote data:", data)
                if (data && typeof data === "object" && "vote" in data) {
                    // capitalize first letter
                    const vote = (data.vote as string);
                    const formatted = vote.charAt(0).toUpperCase() + vote.slice(1);
                    setExistingVote(formatted);
                    setSelectedVote(formatted);
                }
            });
        }
    }, [keplrAddress, selectedProposal]);

    

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        create_proposal(title, description, endTime ? endTime.toString() : undefined)
        .then(() => {
            setTitle('');
            setDescription('');
        })
        .catch((e) => console.error(e))
        .finally(() => {
            setSubmitting(false);
        });
    };

    const handleVote = (vote: string) => {
        setSubmitting(true);
        let parsedVote; 
        if (vote.toLowerCase().startsWith("no") && vote.length > 2) {
            parsedVote = "no_with_veto";
        } else {
            parsedVote = vote.toLowerCase();
        }
        vote_proposal(selectedProposal!.proposal_id!.toString(), parsedVote)
        .then(() => {
            setExistingVote(vote);
            setSelectedVote(vote);
        })
        .finally(() => setSubmitting(false));
    }

    return (
        <div className="flex flex-col full-height justify-start items-center lg:px-8 text-brand-orange">
            <div className="mt-4">

                { proposals.length > 0 && (
                    <div className='border-4 border-brand-orange rounded-lg p-4 mt-2 mb-5'>
                        <h5 className="font-bold">Proposals</h5>

                        <div className="flex flex-col space-y-2 mt-2 gap-2">
                            {proposals.map((proposal, index) => (
                               
                               <button 
                                    key={index} 
                                    disabled={secretBlock.height >= proposal.end_block}
                                    onClick={() => setSelectedProposal(proposal)}
                                    className={(proposal === selectedProposal ? "border-brand-blue"  :  "border-brand-orange")
                                         +  " hover:border-brand-blue hover:text-brand-blue disabled:border-red-200 disabled:text-red-200 flex flex-col  border-2 rounded-lg p-2"}
                                >

                                    <div className='flex justify-between w-full'>
                                        <h6 className="font-bold">{proposal.name}</h6>
                                        <span className="text-sm">
                                        {(secretBlock.height != 0 && secretBlock.height < proposal.end_block) 
                                            ? <>
                                                Ends at: { (new Date(Date.now() + (proposal.end_block - secretBlock.height) * 6000)).toLocaleString() } 
                                                </>
                                            : "Ended"
                                        }
                                        </span>
                                    </div>
                                    <p>{proposal.description}</p>
                                </button>
                            ))}
                        </div>

                        <div className='my-4 flex gap-2 justify-center'>
                            {["Yes", "No", "Abstain", "No With Veto"].map((v) => (
                                <button
                                    key={v}
                                    disabled={!selectedProposal || selectedVote === v}
                                    onClick={() => setSelectedVote(v)}
                                    className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-red-200 active:bg-red-950"
                                >
                                    {v}
                                </button>
                            ))}
                        </div>

                        {selectedVote && (
                            <div className="my-2 flex justify-center">
                                <button
                                    disabled={submitting || !selectedVote}
                                    onClick={() => handleVote(selectedVote)}
                                    className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Vote
                                </button>
                            </div>
                        )}

                        {existingVote && (
                            <div className="my-2 flex justify-center text-brand-orange">
                                You have already voted: {existingVote}
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
                                placeholder="Enter name of the proposal"
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
                        <div className='my-2'>
                            <label className="block text-sm font-medium leading-6 w-full">
                                End Time  (Optional)
                            </label>
                            <input
                                type="number"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                placeholder="Minutes until the end (Default: 60)"
                                className="mt-2 block w-full pl-2 text-brand-blue rounded-md border border-brand-orange bg-brand-tan py-1.5 shadow-sm focus:ring-2 focus:ring-brand-blue sm:text-sm"
                            />
                        </div>
                        <div className="flex justify-center mt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-orange hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Create Proposal
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProposalstModal;
