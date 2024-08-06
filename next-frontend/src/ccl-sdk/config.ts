import { CodeConfig, ContractConfig, IbcConfig } from "./types";

// Hardcoded data
const codeConfig: CodeConfig = {
    gateway: {
        code_id: 8882,
        code_hash: "f3c2e28cd1574d128ded60ce967cdb46f7515d807be49127bcc9249c5fd97802"
    }
};

const contractConfig: ContractConfig = {
    gateway: {
        address: "secret1q0mycclu927u5m0tn50zgl5af4utrlkzz706lm",
        hash: "d4a018804bf63b6cfd5be52b650368e8ad89f57c66841f6b2da7ee143dfc75fb"
    }
};

const ibcConfig: IbcConfig = {
    secret_channel_id: "channel-3",
    consumer_channel_id: "channel-311",
    ibc_denom: "ibc/646433b85336ac9ba9171ec08ec4470d93c149b3354a4a5bf687eb09dfd9e751"
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
