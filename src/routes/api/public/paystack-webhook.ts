import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/paystack-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-paystack-signature");
        const { verifyPaystackSignature } = await import("@/lib/paystack.server");

        if (!verifyPaystackSignature(rawBody, signature)) {
          // Drop unverified requests silently with 200 so Paystack stops retrying.
          return new Response("ok", { status: 200 });
        }

        let event: { event?: string; data?: { reference?: string; amount?: number; status?: string } };
        try {
          event = JSON.parse(rawBody);
        } catch {
          return new Response("ok", { status: 200 });
        }

        try {
          const reference = event.data?.reference;
          if (!reference) return new Response("ok", { status: 200 });

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: funding } = await supabaseAdmin
            .from("wallet_fundings")
            .select("id, total_charged, status")
            .eq("paystack_reference", reference)
            .maybeSingle();

          if (!funding) return new Response("ok", { status: 200 });

          if (event.event === "charge.success") {
            if (funding.status === "success") return new Response("ok", { status: 200 });
            // Cross-reference amount with our stored record — never trust webhook alone.
            const expectedKobo = Number(funding.total_charged) * 100;
            if (event.data?.amount !== expectedKobo) {
              console.warn("paystack webhook amount mismatch", { reference });
              return new Response("ok", { status: 200 });
            }
            const { error } = await supabaseAdmin.rpc("credit_wallet_funding", {
              _reference: reference,
            });
            if (error) console.error("credit_wallet_funding failed", reference, error);
          } else if (event.event === "charge.failed") {
            await supabaseAdmin
              .from("wallet_fundings")
              .update({ status: "failed" })
              .eq("paystack_reference", reference)
              .neq("status", "success");
          }
        } catch (err) {
          console.error("paystack webhook processing error", err);
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
