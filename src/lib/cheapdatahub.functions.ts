import { z } from "zod";
import {
  listDataPlans,
  listCablePlans,
  type DataPlan,
  type CablePlan,
} from "./cheapdatahub.server";

const networkSchema = z.enum(["mtn", "glo", "airtel", "9mobile"]);
const cableSchema = z.enum(["dstv", "gotv", "startimes"]);

export async function getDataPlans(input: { network?: string } | undefined = {}): Promise<{ plans: DataPlan[] }> {
  const data = z.object({ network: networkSchema.optional() }).parse(input ?? {});
  return { plans: listDataPlans(data.network) };
}

export async function getCablePlans(input: { provider?: string } | undefined = {}): Promise<{ plans: CablePlan[] }> {
  const data = z.object({ provider: cableSchema.optional() }).parse(input ?? {});
  return { plans: listCablePlans(data.provider) };
}
