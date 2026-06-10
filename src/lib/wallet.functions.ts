import { z } from "zod";

// Server functions removed - these should be converted to API endpoints
// For now, placeholder functions to prevent build errors

export async function initiateWalletFunding(input: { amount: number }) {
  const data = z.object({ amount: z.number().int().min(200).max(1_000_000) }).parse(input);
  
  // TODO: Call /api/wallet/initiate-funding instead
  console.warn("initiateWalletFunding: This function needs to be converted to an API endpoint");
  throw new Error("Wallet funding API endpoint not configured. Please set up backend API.");
}

export async function getFundingStatus(input: { reference: string }) {
  const data = z.object({ reference: z.string().min(8).max(128) }).parse(input);
  
  // TODO: Call /api/wallet/funding-status instead
  console.warn("getFundingStatus: This function needs to be converted to an API endpoint");
  throw new Error("Wallet funding status API endpoint not configured. Please set up backend API.");
}

    // ALWAYS verify with Paystack as the source of truth before reporting success —
    // defence-in-depth against tampered client state or stale DB rows.
    let verifiedMeta: { kind?: string; description?: string; userId?: string; amount?: number } | undefined;
    try {
      const { verifyPaystackTransaction } = await import("@/lib/paystack.server");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const verified = (await verifyPaystackTransaction(data.reference)) as {
        status: string;
        amount: number;
        reference: string;
        metadata?: { kind?: string; description?: string; userId?: string; amount?: number };
      };
      verifiedMeta = verified.metadata;

      const amountMatches = verified.amount === Number(row.total_charged) * 100;
      if (verified.status === "success" && amountMatches) {
        if (row.status !== "success") {
          await supabaseAdmin.rpc("credit_wallet_funding", { _reference: data.reference });
        }
        row.status = "success";
      } else if (verified.status === "failed" || verified.status === "abandoned") {
        if (row.status !== "success") {
          await supabaseAdmin
            .from("wallet_fundings")
            .update({ status: "failed" })
            .eq("paystack_reference", data.reference);
          row.status = "failed";
        }
      } else if (verified.status === "success" && !amountMatches) {
        // amount mismatch — never report success
        row.status = "failed";
      }
    } catch {
      // verification unavailable — keep current status; poller will retry
    }

    const kind = verifiedMeta?.kind ?? "wallet_funding";
    return {
      reference: row.paystack_reference,
      amount: Number(row.amount),
      fee: Number(row.fee),
      totalCharged: Number(row.total_charged),
      status: row.status as "pending" | "success" | "failed",
      createdAt: row.created_at as string,
      // Receipt details derived from Paystack's verified metadata, not client state.
      type: kind,
      description: kind === "wallet_funding" ? "Wallet Funding" : (verifiedMeta?.description ?? kind),
    };
  });
