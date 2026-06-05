import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  listDataPlans,
  listCablePlans,
  type DataPlan,
  type CablePlan,
} from "./cheapdatahub.server";

const networkSchema = z.enum(["mtn", "glo", "airtel", "9mobile"]);
const cableSchema = z.enum(["dstv", "gotv", "startimes"]);

export const getDataPlans = createServerFn({ method: "GET" })
  .inputValidator((input: { network?: string } | undefined) =>
    z.object({ network: networkSchema.optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<{ plans: DataPlan[] }> => {
    return { plans: listDataPlans(data.network) };
  });

export const getCablePlans = createServerFn({ method: "GET" })
  .inputValidator((input: { provider?: string } | undefined) =>
    z.object({ provider: cableSchema.optional() }).parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<{ plans: CablePlan[] }> => {
    return { plans: listCablePlans(data.provider) };
  });
