import { SecretNetworkClient, Wallet } from "secretjs";
import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();
const wallet = new Wallet(process.env.SECRET_MNEMONIC);
const contract_wasm = fs.readFileSync("../deploy-scripts/optimized-wasm/secret_voting.wasm.gz");

const secretjs = new SecretNetworkClient({
    chainId: "pulsar-3",
    url: "https://lcd.testnet.secretsaturn.net",
    wallet: wallet,
    walletAddress: wallet.address,
});
// Declare global variables
let codeId;
let contractCodeHash;
let contractAddress;
const upload_contract = async () => {
    console.log("Starting deployment…");
    const tx = await secretjs.tx.compute.storeCode({
        sender: wallet.address,
        wasm_byte_code: contract_wasm,
        source: "",
        builder: "",
    }, {
        gasLimit: 5000000,
    });
    const codeIdLog = tx.arrayLog?.find((log) => log.type === "message" && log.key === "code_id")?.value;
    if (!codeIdLog) {
        throw new Error("code_id not found in transaction logs.");
    }
    codeId = Number(codeIdLog);
    console.log("codeId: ", codeId);
    contractCodeHash = (await secretjs.query.compute.codeHashByCodeId({ code_id: codeId.toString() })).code_hash;
    console.log(`Contract hash: ${contractCodeHash}`);
};
const instantiate_contract = async () => {
    if (!codeId || !contractCodeHash) {
        throw new Error("codeId or contractCodeHash is not set.");
    }
    console.log("Instantiating contract…");
    const tx = await secretjs.tx.compute.instantiateContract({
        code_id: codeId,
        sender: wallet.address,
        code_hash: contractCodeHash,
        init_msg: {},
        label: "CCL SDK " + Math.ceil(Math.random() * 10000),
    }, {
        gasLimit: 5000000,
    });
    // Find the contract_address in the logs
    const contractAddressLog = tx.arrayLog?.find((log) => log.type === "message" && log.key === "contract_address")?.value;
    if (!contractAddressLog) {
        throw new Error("contract_address not found in transaction logs.");
    }
    contractAddress = contractAddressLog;
    console.log("contract address: ", contractAddress);
};
// Chain the execution using promises
upload_contract()
    .then(() => {
    instantiate_contract();
})
    .catch((error) => {
    console.error("Error:", error);
});
