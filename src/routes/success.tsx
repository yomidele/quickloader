import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

// Legacy route — receipts must come from server-verified Paystack data.
// Forward to /payment-pending which performs server-side verification before
// rendering the receipt from the verified transaction's metadata.
export const Route = createFileRoute("/success")({
  validateSearch: (search) => z.object({ reference: z.string().optional() }).parse(search),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/payment-pending",
      search: search.reference ? { reference: search.reference } : {},
    });
  },
  component: () => null,
});
