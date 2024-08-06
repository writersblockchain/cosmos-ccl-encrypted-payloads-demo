import { readFileSync, writeFileSync, existsSync } from "fs";
export const CONFIG_DIR = 'configs';
export const CODE_FILE = 'codes.json';
export const CONTRACTS_FILE = 'contracts.json';
export const IBC_FILE = 'ibc.json';
export const CODE_CONFIG_PATH = `${CONFIG_DIR}/${CODE_FILE}`;
export const CONTRACT_CONFIG_PATH = `${CONFIG_DIR}/${CONTRACTS_FILE}`;
export const IBC_CONFIG_PATH = `${CONFIG_DIR}/${IBC_FILE}`;
export const loadCodeConfig = () => {
    return JSON.parse(readFileSync(CODE_CONFIG_PATH, 'utf8'));
};
export const loadContractConfig = () => {
    return JSON.parse(readFileSync(CONTRACT_CONFIG_PATH, 'utf8'));
};
export const loadIbcConfig = () => {
    return JSON.parse(readFileSync(IBC_CONFIG_PATH, 'utf8'));
};
export const saveCodeConfig = (config) => {
    const json = JSON.stringify(config, null, 4);
    writeFileSync(CODE_CONFIG_PATH, json, 'utf8');
};
export const saveContractConfig = (config) => {
    const json = JSON.stringify(config, null, 4);
    writeFileSync(CONTRACT_CONFIG_PATH, json, 'utf8');
};
export const saveIbcConfig = (config) => {
    const json = JSON.stringify(config, null, 4);
    writeFileSync(IBC_CONFIG_PATH, json, 'utf8');
};
export const codeConfigFileExists = () => {
    return existsSync(CODE_CONFIG_PATH);
};
export const codeConfigExists = () => {
    if (!existsSync(CODE_CONFIG_PATH))
        return false;
    const config = loadCodeConfig();
    return Boolean(config.gateway);
};
export const contractConfigFileExists = () => {
    return existsSync(CONTRACT_CONFIG_PATH);
};
export const contractConfigExists = () => {
    if (!contractConfigFileExists())
        return false;
    const config = loadContractConfig();
    return Boolean(config.gateway);
};
export const ibcConfigExists = () => {
    return existsSync(IBC_CONFIG_PATH);
};
