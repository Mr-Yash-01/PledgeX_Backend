import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config(); // ✅ Load .env variables

// ✅ Fix file path issue (ensure correct location)
const ESCROW_ABI_PATH = path.join(__dirname, "../Escrow.json");
const ESCROW_ABI = JSON.parse(fs.readFileSync(ESCROW_ABI_PATH, "utf8")).abi;

// ✅ Check RPC URL
if (!process.env.RPC_URL) {
  throw new Error("RPC_URL is not defined in the .env file");
}

// ✅ Create Provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// ✅ Ensure ESCROW_ADDRESS exists
const ESCROW_ADDRESS = process.env.ESCROW_ADDRESS;
if (!ESCROW_ADDRESS) {
  throw new Error("ESCROW_ADDRESS is not defined in the .env file");
}

// ✅ Ensure PRIVATE_KEY exists
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not defined in the .env file");
}

// ✅ Create Signer (Required for Transactions)
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// ✅ Attach Signer to Contract
const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);

console.log("✅ Escrow contract initialized with a signer!");

export { escrowContract, provider, signer };

