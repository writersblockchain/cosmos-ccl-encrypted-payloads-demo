
import { sha256 } from "@noble/hashes/sha256";
import { readFileSync, readdirSync } from "fs"
import { toHex, MsgStoreCodeParams, TxResultCode } from "secretjs"
import { codeConfigExists, codeConfigFileExists, loadCodeMultiConfig, saveCodeMultiConfig, saveContractMultiConfig } from "./config";
import { instantiateExamples } from "./gateway";
import { CodeMultiConfig, ContractMultiConfig } from "./types";
import { secretClient } from "./clients";


export const uploadContracts = async (
    wasmDirPath: string = "artifacts"
) => {
    console.log("Uploading contracts...");

    const config : CodeMultiConfig = codeConfigFileExists() ? loadCodeMultiConfig() : {};

    for (const file of readdirSync(wasmDirPath).filter(f => f.includes(".wasm"))) {
        if (file.includes("secrets") && Boolean(config.secrets)) continue;
        if (file.includes("votes") && Boolean(config.votes)) continue;
        if (file.includes("auctions") && Boolean(config.auctions)) continue;

        console.log(`Uploading contract: ${file}`);

        const wasmPath = `${wasmDirPath}/${file}`;
        const wasm_byte_code = readFileSync(wasmPath) as Uint8Array;
        const codeHash = toHex(sha256(wasm_byte_code)); 

        const msg : MsgStoreCodeParams = {
            sender: secretClient.address,
            wasm_byte_code,
            source: "",
            builder: ""
        }

        const tx = await secretClient.tx.compute.storeCode(msg, { gasLimit: 8_000_000 });

        if (tx.code !==  TxResultCode.Success) {
            throw new Error(`Error while uploading contract: ${tx.rawLog}`);
        }

        const codeId = Number(tx.arrayLog!.find(x => x.key === "code_id")!.value);

        const contract = {
            code_id: codeId,
            code_hash: codeHash
        }

        if (file.includes("secrets")) {
            config.secrets = contract
        }
        

        if (file.includes("votes")) {
            config.votes = contract
        }

        if (file.includes("auctions")) {
            config.auctions = contract
        }
       
        saveCodeMultiConfig(config);
    }

    if (!codeConfigExists()) {
        throw new Error("No contracts to upload. Make sure the .wasm files are in " 
            + wasmDirPath + " directory");
    }
}

export const instantiateContracts = async () => {
    
    const res = await instantiateExamples();
    const config : ContractMultiConfig = {
        secrets: res[0],
        votes: res[1],
        auctions: res[2]
    }
    saveContractMultiConfig(config);
}