import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getRequestHost, getRequestHeader } from "@tanstack/react-start/server";

export const initiateWalletFunding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { amount: number }) =>
    z.object({ amount: z.number().int().min(200).max(1_000_000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { FUNDING_FEE, MIN_FUND_AMOUNT, initializePaystack } = await import(
      "@/lib/paystack.server"
    );
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.amount < MIN_FUND_AMOUNT) {
      throw new Error(`Minimum funding amount is ₦${MIN_FUND_AMOUNT}`);
    }

    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();
    if (pErr || !profile?.email) throw new Error("Could not load account email");

    const totalCharged = data.amount + FUNDING_FEE;
    const reference = `WF_${userId.replace(/-/g, "").slice(0, 12)}_${Date.now()}`;

    // Build absolute callback URL — Paystack rejects relative URLs.
    const proto = getRequestHeader("x-forwarded-proto") ?? "https";
    const host = getRequestHost();
    const callbackUrl = `${proto}://${host}/payment-pending?reference=${reference}`;

    const paystack = await initializePaystack({
      email: profile.email,
      amountKobo: totalCharged * 100,
      reference,
      callbackUrl,
      metadata: { userId, kind: "wallet_funding", amount: data.amount },
    });

    const { error: insErr } = await supabaseAdmin.from("wallet_fundings").insert({
      user_id: userId,
      amount: data.amount,
      fee: FUNDING_FEE,
      total_charged: totalCharged,
      paystack_reference: reference,
      paystack_access_code: paystack.access_code,
      status: "pending",
    });
    if (insErr) throw new Error(insErr.message);

    return {
      reference,
      authorizationUrl: paystack.authorization_url,
      amount: data.amount,
      fee: FUNDING_FEE,
      totalCharged,
    };
  });

export const getFundingStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { reference: string }) =>
    z.object({ reference: z.string().min(8).max(128) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("wallet_fundings")
      .select("amount, fee, total_charged, status, paystack_reference, created_at")
      .eq("paystack_reference", data.reference)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Funding not found");

    // ALWAYS verify with Paystack as the source of truth before reporting success —
    // defence-in-depth against tampered client state or stale DB rows.
    let verifiedMeta: Record<string, unknown> | undefined;
    try {
      const { verifyPaystackTransaction } = await import("@/lib/paystack.server");
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const verified = (await verifyPaystackTransaction(data.reference)) as {
        status: string;
        amount: number;
        reference: string;
        metadata?: Record<string, unknown>;
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

    const kind = (verifiedMeta?.kind as string | undefined) ?? "wallet_funding";
    return {
      reference: row.paystack_reference,
      amount: Number(row.amount),
      fee: Number(row.fee),
      totalCharged: Number(row.total_charged),
      status: row.status as "pending" | "success" | "failed",
      createdAt: row.created_at as string,
      // Receipt details derived from Paystack's verified metadata, not client state.
      type: kind,
      description: kind === "wallet_funding" ? "Wallet Funding" : kind,
      metadata: verifiedMeta ?? null,
    };
  });
