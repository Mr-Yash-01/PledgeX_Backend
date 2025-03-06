require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

// Load contract details
const ESCROW_ADDRESS = process.env.ESCROW_ADDRESS;
const RPC_URL = process.env.RPC_URL;
const ESCROW_ABI = JSON.parse(fs.readFileSync("./Escrow.json")).abi;

// Create Provider (Read-Only)
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Create Contract Instance (Read-Only)
const escrowContract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, provider);

console.log("✅ Escrow contract initialized globally!");

module.exports = { escrowContract, provider };
