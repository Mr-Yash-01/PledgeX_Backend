import { ethers } from "ethers";
import fs from "fs";
import path from "path";


// ✅ Fix file path issue (ensure correct location)
const ESCROW_ABI_PATH = path.join(__dirname, "../Escrow.json");
const ESCROW_ABI = JSON.parse(fs.readFileSync(ESCROW_ABI_PATH, "utf8")).abi;

// Create Provider (Read-Only)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
console.log("sfgsfgsgfsfgf",process.env.ESCROW_ADDRESS);

const ESCROW_ADDRESS = process.env.ESCROW_ADDRESS;
if (!ESCROW_ADDRESS) {
  throw new Error("ESCROW_ADDRESS is not defined in the .env file");
}

const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);

console.log("✅ Escrow contract initialized globally!");

export { escrowContract, provider };
