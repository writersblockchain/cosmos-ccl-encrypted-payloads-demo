import React, { useContext, useEffect, useState } from 'react';
import { ExecuteGateway, QueryGateway } from "../functions/Gateway";
import { Proposal } from '@/utils/types';
import { CosmosjsContext } from '@/utils/CosmosContext';

const ProposalstModal = () => {
    const context = useContext(CosmosjsContext);

    let keplrAddress = context?.keplrAddress;
    let chainId = context?.chainId;
  
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [selectedVote, setSelectedVote] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [proposals, setProposals] = useState<Proposal[]>([
        { name: 'Proposal 1', description: 'Description 1', end_time: '2021-09-01', proposal_id: 1 },
        { name: 'Proposal 2', description: 'Description 2', end_time: '2021-09-02', proposal_id: 2 },
    ]);

    const { create_proposal, vote_proposal } = ExecuteGateway();
    const { query_proposals, query_my_vote } = QueryGateway();

    // Fetch proposals
    useEffect(() => {
        query_proposals()
        .then((data) => {
            console.log('query props data', data);
            if (data && Array.isArray(data)) {
                setProposals(data);
            }
        })
    }, [chainId, keplrAddress]);

    // Fetch user's vote
    useEffect(() => {
        if (selectedProposal) {
            query_my_vote(selectedProposal.proposal_id)
            .then((data) => {
                console.log("vote data:", data)
                if (typeof data === "object" && "vote" in data) {
                    setSelectedVote(data.vote);
                }
            });
        }
    }, [keplrAddress, selectedProposal]);

    
    // reset votes on proposal change
    useEffect(() => {
        setSelectedVote(null);
    }, [selectedProposal]);



    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSubmitting(true);
        create_proposal(title, description)
        .then(() => {
            setTitle('');
            setDescription('');
        })
        .catch((e) => console.error(e))
        .finally(() => setSubmitting(false));

        /* if (query_gateway_contract) { // Ensure execute_gateway_contract is defined
            setSubmitting(true);
            query_gateway_contract(title)
            .finally(() => setSubmitting(false));
        } else {
            console.error("execute_gateway_contract is not available.");
        } */
    };

    const handleVote = (vote: string) => {
        console.log('vote', vote);

       /*  if (query_gateway_contract) { 
            setSubmitting(true);
            query_gateway_contract(vote)
            .finally(() => setSubmitting(false));
        } else {
            console.error("execute_gateway_contract is not available.");
        } */
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
                                    disabled={proposal === selectedProposal}
                                    onClick={() => setSelectedProposal(proposal)}
                                    className="flex flex-col  border-2 rounded-lg p-2 border-brand-orange hover:border-brand-blue hover:text-brand-blue disabled:border-red-200 disabled:text-red-200"
                                >
                                    <div className='flex justify-between w-full'>
                                        <h6 className="font-bold">{proposal.name}</h6>
                                        <p>{proposal.end_time}</p>
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
