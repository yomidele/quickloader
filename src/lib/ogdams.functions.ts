import { supabase } from "@/integrations/supabase/client";

export interface OgdamsDataPlan {
  plan_id: number;
  networkId: number;
  network: "mtn" | "airtel" | "glo" | "9mobile";
  size: string;
  validity: string;
  type: string;
  cost: number;   // Ogdams price
  price: number;  // retail (cost + ₦50)
}

/** Live data plans from Ogdams SimHosting (via edge function). */
export async function getDataPlans(
  input: { network?: string } = {},
): Promise<{ plans: OgdamsDataPlan[] }> {
  const { data, error } = await supabase.functions.invoke("ogdams-data-plans", {
    body: { network: input.network },
  });
  if (error) throw new Error(error.message || "Failed to fetch data plans");
  return { plans: (data?.plans ?? []) as OgdamsDataPlan[] };
}

// Cable plans stay on the local catalog for now (Ogdams doesn't cover TV here).
export { getCablePlans } from "./cheapdatahub.functions";
