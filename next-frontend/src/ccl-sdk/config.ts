import { CodeConfig, CodeMultiConfig, ContractConfig, ContractMultiConfig, IbcConfig } from "./types";

// Hardcoded data

//Secret testnet
// const codeConfig: CodeConfig = {
//     gateway: {
//         code_id: 8882,
//         code_hash: "d4a018804bf63b6cfd5be52b650368e8ad89f57c66841f6b2da7ee143dfc75fb"
//     }
// };

//Secret mainnet
const codeConfig: CodeConfig = {
    gateway: {
        /* code_id: 1799,
        code_hash: "83fdee3ad26ca8849a837b70ac25bd704e0aaab76b97dcc13c0125ddccbd956e" */
        code_id: 1940,
        code_hash: "245fde8f319d3d7ac4a038435192dbddec196e9bed23e07f906ea30b184fc28b"
    }
};

//Secret testnet
// const contractConfig: ContractConfig = {
//     gateway: {
//         address: "secret1q0mycclu927u5m0tn50zgl5af4utrlkzz706lm",
//         hash: "d4a018804bf63b6cfd5be52b650368e8ad89f57c66841f6b2da7ee143dfc75fb"
//     }
// };

//Secret mainnet


const codeMultiConfig: CodeMultiConfig = {
    auctions: {
        code_id: 1942,
        code_hash: "9eaaeb849d139f2286c067fadf9c9ae73e27317ead0bb7240dc9ae32c83dfb4a",
    },

    votes: {
        code_id: 1941,
        code_hash: "9947008f7a5a291422c2d79b34187eef0fdae190d4bc35a2b051e61abaa0bbc7",
    },

    secrets: {
        code_id: 1940,
        code_hash: "245fde8f319d3d7ac4a038435192dbddec196e9bed23e07f906ea30b184fc28b"
    },
};



const contractConfig: ContractConfig = {
    gateway: {
        address: "secret1md6xaernnpu04swp4erhn5x8vsv0ehnv2l9myj",
        hash: "245fde8f319d3d7ac4a038435192dbddec196e9bed23e07f906ea30b184fc28b"
    }
};




const contractMultiConfig: ContractMultiConfig = {
    auctions: {
        address: "secret1feeat5t3tqg72hha9nstpapc3q7hqhqskrn4m3",
        hash: "9418039da258a045baa254211488176f22dee652a92651642a132514e51629b9"
    },
    votes: {
        address: "secret1j7d8h72udlqaqcxn9l35z8972lm2glaqytyx37",
        hash: "9947008f7a5a291422c2d79b34187eef0fdae190d4bc35a2b051e61abaa0bbc7"
    },
    secrets: {
        address: "secret1md6xaernnpu04swp4erhn5x8vsv0ehnv2l9myj",
        hash: "245fde8f319d3d7ac4a038435192dbddec196e9bed23e07f906ea30b184fc28b"
    },
};

//Axelar testnet config
// const ibcConfig: IbcConfig = {
//     secret_channel_id: "channel-3",
//     consumer_channel_id: "channel-311",
//     ibc_denom: "ibc/646433b85336ac9ba9171ec08ec4470d93c149b3354a4a5bf687eb09dfd9e751"
// };

//Osmosis mainnet config
const osmoConfig: IbcConfig = {
    secret_channel_id: "channel-1",
    consumer_channel_id: "channel-88",
    ibc_denom: "ibc/19f40553b5a6948aa6bdef18bff71bf782008f68e03d39f2e6d5b822ba729deb"
};


const cosmoConfig: IbcConfig = {
    secret_channel_id: "channel-0",
    consumer_channel_id: "channel-235",
    ibc_denom: "ibc/TODO"
};

// Functions to get the config data
export const loadCodeConfig = (): CodeConfig => {
    return codeConfig;
};

export const loadContractConfig = (): ContractConfig => {
    return contractConfig;
};


export const loadCodeMultiConfig = (): CodeMultiConfig => (codeMultiConfig)
export const loadContractMultiConfig = (): ContractMultiConfig => (contractMultiConfig)


export const loadIbcConfig = (chainId?: string): IbcConfig => {
    return chainId === "osmosis-1" ? osmoConfig : cosmoConfig;
};


// The save functions are no-ops since data is hardcoded
export const saveCodeConfig = (config: CodeConfig): void => {
    console.warn("saveCodeConfig: Operation not supported for hardcoded data.");
};


export const saveCodeMultiConfig = (config: CodeMultiConfig): void => {
    console.warn("saveCodeMultiConfig: Operation not supported for hardcoded data.");
}

export const saveContractMultiConfig = (config: ContractMultiConfig): void => {
    console.warn("saveContractMultiConfig: Operation not supported for hardcoded data.");
}


export const saveContractConfig = (config: ContractConfig): void => {
    console.warn("saveContractConfig: Operation not supported for hardcoded data.");
};

export const saveIbcConfig = (config: IbcConfig): void => {
    console.warn("saveIbcConfig: Operation not supported for hardcoded data.");
};

// Functions to check if configs exist
export const codeConfigFileExists = (): boolean => (true)
export const codeMultiConfigExists = (): boolean => (true)
export const contractConfigFileExists = (): boolean => (true)
export const ibcConfigExists = (): boolean => (true)
export const codeConfigExists = (): boolean => (Boolean(codeConfig.gateway))
export const contractConfigExists = (): boolean => (Boolean(contractConfig.gateway))
