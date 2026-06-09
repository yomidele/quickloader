import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

// Legacy route — failure state must reflect server-verified Paystack data.
export const Route = createFileRoute("/failed")({
  validateSearch: (search) => z.object({ reference: z.string().optional() }).parse(search),
  beforeLoad: ({ search }) => {
    throw redirect({
      to: search.reference ? "/payment-pending" : "/wallet",
      search: search.reference ? { reference: search.reference } : undefined,
    });
  },
  component: () => null,
});
