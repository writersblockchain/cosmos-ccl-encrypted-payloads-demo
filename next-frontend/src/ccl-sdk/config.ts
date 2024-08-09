import { CodeConfig, ContractConfig, IbcConfig } from "./types";

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
        code_id: 1799,
        code_hash: "83fdee3ad26ca8849a837b70ac25bd704e0aaab76b97dcc13c0125ddccbd956e"
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
        address: "secret1ftsnjw3nc7zkr0lngc7h3af7d9gqyzf5syn0cu",
        hash: "83fdee3ad26ca8849a837b70ac25bd704e0aaab76b97dcc13c0125ddccbd956e"
    }
};

//Axelar testnet config
// const ibcConfig: IbcConfig = {
//     secret_channel_id: "channel-3",
//     consumer_channel_id: "channel-311",
//     ibc_denom: "ibc/646433b85336ac9ba9171ec08ec4470d93c149b3354a4a5bf687eb09dfd9e751"
// };

//Osmosis mainnet config
const ibcConfig: IbcConfig = {
    secret_channel_id: "channel-1",
    consumer_channel_id: "channel-88",
    ibc_denom: "ibc/19f40553b5a6948aa6bdef18bff71bf782008f68e03d39f2e6d5b822ba729deb"
};


// Functions to get the config data
export const loadCodeConfig = (): CodeConfig => {
    return codeConfig;
};

export const loadContractConfig = (): ContractConfig => {
    return contractConfig;
};

export const loadIbcConfig = (): IbcConfig => {
    return ibcConfig;
};

// The save functions are no-ops since data is hardcoded
export const saveCodeConfig = (config: CodeConfig): void => {
    console.warn("saveCodeConfig: Operation not supported for hardcoded data.");
};

export const saveContractConfig = (config: ContractConfig): void => {
    console.warn("saveContractConfig: Operation not supported for hardcoded data.");
};

export const saveIbcConfig = (config: IbcConfig): void => {
    console.warn("saveIbcConfig: Operation not supported for hardcoded data.");
};

// Functions to check if configs exist
export const codeConfigFileExists = (): boolean => {
    return true;
};

export const codeConfigExists = (): boolean => {
    return Boolean(codeConfig.gateway);
};

export const contractConfigFileExists = (): boolean => {
    return true;
};

export const contractConfigExists = (): boolean => {
    return Boolean(contractConfig.gateway);
};

export const ibcConfigExists = (): boolean => {
    return true;
};
