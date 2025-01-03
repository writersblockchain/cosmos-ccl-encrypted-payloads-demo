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


const contractConfig: ContractConfig = {
    gateway: {
        address: "secret1md6xaernnpu04swp4erhn5x8vsv0ehnv2l9myj",
        hash: "245fde8f319d3d7ac4a038435192dbddec196e9bed23e07f906ea30b184fc28b"
    }
};




const codeMultiConfig: CodeMultiConfig = {
    auctions: {
        code_id: 1948,
        code_hash: "453ab9ce4e41d7530fae64bab28c4e472ebbcb7f05a87ee3627021ecb8416d3a",
    },

    votes: {
        code_id: 1949,
        code_hash: "ff8443878e8a339637c45c13abc4385c4f0c5668b992afc912e5f59e5d098654",
    },

    secrets: {
        code_id: 1940,
        code_hash: "245fde8f319d3d7ac4a038435192dbddec196e9bed23e07f906ea30b184fc28b"
    },
};



const contractMultiConfig: ContractMultiConfig = {
    auctions: {
        address: "secret1xn5e623kqht0u84tmvljfkdrdm4spkrsaeczax",
        hash: "453ab9ce4e41d7530fae64bab28c4e472ebbcb7f05a87ee3627021ecb8416d3a"
    },
    votes: {
        address: "secret1jtc7f8cj5hhc2mg9v5uknd84knvythvsjhd66a",
        hash: "ff8443878e8a339637c45c13abc4385c4f0c5668b992afc912e5f59e5d098654"
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
