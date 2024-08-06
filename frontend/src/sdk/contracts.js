import { sha256 } from "@noble/hashes/sha256";
import { readFileSync, readdirSync } from "fs";
import { toHex, TxResultCode } from "secretjs";
import { codeConfigExists, codeConfigFileExists, contractConfigFileExists, loadCodeConfig, loadContractConfig, saveCodeConfig, saveContractConfig } from "./config.js";
import { instantiateGatewaySimple } from "./gateway.js";
import { secretClient } from "./clients.js";
export const uploadContracts = async (wasmDirPath = "artifacts") => {
    console.log("Uploading contracts...");
    const config = codeConfigFileExists() ? loadCodeConfig() : {};
    for (const file of readdirSync(wasmDirPath).filter(f => f.includes(".wasm"))) {
        if (file.includes("gateway") && Boolean(config.gateway))
            continue;
        console.log(`Uploading contract: ${file}`);
        const wasmPath = `${wasmDirPath}/${file}`;
        const wasm_byte_code = readFileSync(wasmPath);
        const codeHash = toHex(sha256(wasm_byte_code));
        const msg = {
            sender: secretClient.address,
            wasm_byte_code,
            source: "",
            builder: ""
        };
        const tx = await secretClient.tx.compute.storeCode(msg, { gasLimit: 8000000 });
        if (tx.code !== TxResultCode.Success) {
            throw new Error(`Error while uploading contract: ${tx.rawLog}`);
        }
        const codeId = Number(tx.arrayLog.find(x => x.key === "code_id").value);
        const contract = {
            code_id: codeId,
            code_hash: codeHash
        };
        if (file.includes("gateway")) {
            config.gateway = contract;
        }
        if (file.includes("snip20")) {
            config.snip20 = contract;
        }
        saveCodeConfig(config);
    }
    if (!codeConfigExists()) {
        throw new Error("No contracts to upload. Make sure the .wasm files are in "
            + wasmDirPath + " directory");
    }
};
export const instantiateContracts = async () => {
    const config = contractConfigFileExists()
        ? loadContractConfig()
        : {};
    /* if (!Boolean(config.sscrt)) {
        config.sscrt = await instantiateSnip20("Secret SCRT", "sSCRT", SECRET_TOKEN!);
        await sleep(1000);
        saveContractConfig(config);
    } */
    config.gateway = await instantiateGatewaySimple();
    saveContractConfig(config);
};
