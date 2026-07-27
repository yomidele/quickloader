import { z } from "zod";

// Server functions removed - these should be converted to API endpoints
// For now, placeholder functions to prevent build errors

export async function initiateWalletFunding(input: { amount: number }) {
  z.object({ amount: z.number().int().min(200).max(1_000_000) }).parse(input);
  console.warn("initiateWalletFunding: needs backend API endpoint");
  throw new Error("Wallet funding API endpoint not configured.");
}

export async function getFundingStatus(input: { reference: string }) {
  z.object({ reference: z.string().min(8).max(128) }).parse(input);
  console.warn("getFundingStatus: needs backend API endpoint");
  throw new Error("Wallet funding status API endpoint not configured.");
}
