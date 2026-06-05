// Server-only helper for the CheapDataHub VTU API.
// Plan catalog mirrors https://www.cheapdatahub.ng/api/plan-ids/ (public, maintained
// by the provider). Cost prices below are wholesale; retail price applies markup.

export type Network = "mtn" | "glo" | "airtel" | "9mobile";
export type CableProvider = "dstv" | "gotv" | "startimes";

export interface DataPlan {
  plan_id: number;
  network: Network;
  size: string;
  validity: string;
  type: string;
  cost: number;
  price: number;
}

export interface CablePlan {
  plan_id: number;
  provider: CableProvider;
  name: string;
  cost: number;
  price: number;
}

const DATA_MARKUP = 0.06; // 6% retail markup
const CABLE_MARKUP = 0.02; // 2% retail markup

const retail = (cost: number, m: number) => Math.ceil((cost * (1 + m)) / 5) * 5;

const RAW_DATA: Omit<DataPlan, "price">[] = [
  // AIRTEL
  { plan_id: 70, network: "airtel", size: "1GB", validity: "3 Days", type: "Social Bundle", cost: 295 },
  { plan_id: 13, network: "airtel", size: "500MB", validity: "7 Days", type: "Gifting", cost: 490 },
  { plan_id: 69, network: "airtel", size: "1.5GB", validity: "1 Day", type: "Gifting", cost: 500 },
  { plan_id: 66, network: "airtel", size: "1.5GB", validity: "2 Days", type: "Gifting", cost: 599 },
  { plan_id: 15, network: "airtel", size: "1GB", validity: "7 Days", type: "Gifting", cost: 785 },
  { plan_id: 17, network: "airtel", size: "2GB", validity: "30 Days", type: "Gifting", cost: 1470 },
  { plan_id: 52, network: "airtel", size: "5GB", validity: "7 Days", type: "Gifting", cost: 1570 },
  { plan_id: 18, network: "airtel", size: "3GB", validity: "30 Days", type: "Gifting", cost: 1960 },
  { plan_id: 22, network: "airtel", size: "6GB", validity: "7 Days", type: "SME", cost: 2455 },
  { plan_id: 19, network: "airtel", size: "4GB", validity: "30 Days", type: "Gifting", cost: 2570 },
  { plan_id: 20, network: "airtel", size: "8GB", validity: "30 Days", type: "Gifting", cost: 2999 },
  { plan_id: 21, network: "airtel", size: "10GB", validity: "30 Days", type: "Gifting", cost: 4070 },
  // GLO
  { plan_id: 42, network: "glo", size: "200MB", validity: "1 Day", type: "Corporate", cost: 92 },
  { plan_id: 35, network: "glo", size: "500MB", validity: "30 Days", type: "Corporate", cost: 225 },
  { plan_id: 68, network: "glo", size: "1GB", validity: "3 Days", type: "Corporate", cost: 300 },
  { plan_id: 36, network: "glo", size: "1GB", validity: "30 Days", type: "Corporate", cost: 425 },
  { plan_id: 41, network: "glo", size: "1GB", validity: "14 Days", type: "Gifting", cost: 485 },
  { plan_id: 40, network: "glo", size: "2GB", validity: "30 Days", type: "Corporate", cost: 850 },
  { plan_id: 37, network: "glo", size: "3GB", validity: "30 Days", type: "Corporate", cost: 1300 },
  { plan_id: 54, network: "glo", size: "5GB", validity: "7 Days", type: "Corporate", cost: 1699 },
  { plan_id: 38, network: "glo", size: "5GB", validity: "30 Days", type: "Corporate", cost: 2250 },
  { plan_id: 39, network: "glo", size: "10GB", validity: "30 Days", type: "Corporate", cost: 4390 },
  { plan_id: 59, network: "glo", size: "20.5GB", validity: "30 Days", type: "Gifting", cost: 5300 },
  { plan_id: 58, network: "glo", size: "107GB", validity: "30 Days", type: "Gifting", cost: 19300 },
  // MTN
  { plan_id: 43, network: "mtn", size: "110MB", validity: "1 Day", type: "Gifting", cost: 99 },
  { plan_id: 74, network: "mtn", size: "230MB", validity: "1 Day", type: "Gifting", cost: 200 },
  { plan_id: 76, network: "mtn", size: "500MB", validity: "2 Days", type: "SME", cost: 250 },
  { plan_id: 78, network: "mtn", size: "1GB", validity: "1 Day", type: "SME", cost: 280 },
  { plan_id: 44, network: "mtn", size: "500MB", validity: "30 Days", type: "SME", cost: 350 },
  { plan_id: 77, network: "mtn", size: "1GB", validity: "2 Days", type: "SME", cost: 399 },
  { plan_id: 45, network: "mtn", size: "1GB", validity: "7 Days", type: "SME", cost: 450 },
  { plan_id: 46, network: "mtn", size: "1GB", validity: "30 Days", type: "SME", cost: 570 },
  { plan_id: 79, network: "mtn", size: "2.5GB", validity: "1 Day", type: "SME", cost: 600 },
  { plan_id: 27, network: "mtn", size: "2.5GB", validity: "2 Days", type: "Gifting", cost: 900 },
  { plan_id: 71, network: "mtn", size: "2GB", validity: "7 Days", type: "Gifting", cost: 900 },
  { plan_id: 47, network: "mtn", size: "2GB", validity: "7 Days", type: "SME", cost: 930 },
  { plan_id: 60, network: "mtn", size: "3.5GB", validity: "1 Day", type: "Gifting", cost: 980 },
  { plan_id: 48, network: "mtn", size: "2GB", validity: "30 Days", type: "SME", cost: 1150 },
  { plan_id: 61, network: "mtn", size: "4GB", validity: "2 Days", type: "Gifting", cost: 1175 },
  { plan_id: 80, network: "mtn", size: "5GB", validity: "14 Days", type: "Corporate", cost: 1299 },
  { plan_id: 49, network: "mtn", size: "3GB", validity: "30 Days", type: "SME", cost: 1370 },
  { plan_id: 50, network: "mtn", size: "5GB", validity: "30 Days", type: "SME", cost: 2050 },
  { plan_id: 53, network: "mtn", size: "6GB", validity: "7 Days", type: "Gifting", cost: 2495 },
  { plan_id: 55, network: "mtn", size: "11GB", validity: "7 Days", type: "Gifting", cost: 3430 },
  { plan_id: 33, network: "mtn", size: "7GB", validity: "30 Days", type: "Gifting", cost: 3499 },
  { plan_id: 67, network: "mtn", size: "10GB", validity: "30 Days", type: "Gifting", cost: 4470 },
  { plan_id: 57, network: "mtn", size: "36GB", validity: "30 Days", type: "Gifting", cost: 10800 },
  { plan_id: 51, network: "mtn", size: "75GB", validity: "30 Days", type: "SME", cost: 17990 },
];

const RAW_CABLE: Omit<CablePlan, "price">[] = [
  { plan_id: 3, provider: "dstv", name: "DStv Padi", cost: 4400 },
  { plan_id: 6, provider: "dstv", name: "DStv Yanga", cost: 6000 },
  { plan_id: 7, provider: "dstv", name: "DStv Confam", cost: 11000 },
  { plan_id: 8, provider: "dstv", name: "DStv Compact", cost: 19000 },
  { plan_id: 9, provider: "dstv", name: "DStv Compact Plus", cost: 30000 },
  { plan_id: 10, provider: "dstv", name: "DStv Premium", cost: 44500 },
  { plan_id: 4, provider: "gotv", name: "GOtv Smallie", cost: 1900 },
  { plan_id: 11, provider: "gotv", name: "GOtv Jinja", cost: 3900 },
  { plan_id: 12, provider: "gotv", name: "GOtv Jolli", cost: 5800 },
  { plan_id: 13, provider: "gotv", name: "GOtv Max", cost: 8500 },
  { plan_id: 14, provider: "gotv", name: "GOtv Supa", cost: 11400 },
  { plan_id: 15, provider: "gotv", name: "GOtv Supa Plus", cost: 16800 },
  { plan_id: 5, provider: "startimes", name: "Nova (Antenna) — 1 Week", cost: 700 },
  { plan_id: 16, provider: "startimes", name: "Nova (Dish) — 1 Week", cost: 700 },
  { plan_id: 17, provider: "startimes", name: "Nova (Antenna) — 1 Month", cost: 2100 },
  { plan_id: 18, provider: "startimes", name: "Basic (Antenna) — 1 Week", cost: 1400 },
  { plan_id: 19, provider: "startimes", name: "Basic (Dish) — 1 Week", cost: 1700 },
  { plan_id: 20, provider: "startimes", name: "Basic (Antenna) — 1 Month", cost: 4000 },
  { plan_id: 21, provider: "startimes", name: "Basic (Dish) — 1 Month", cost: 5100 },
  { plan_id: 22, provider: "startimes", name: "Classic (Dish) — 1 Week", cost: 2500 },
  { plan_id: 23, provider: "startimes", name: "Classic (Dish) — 1 Month", cost: 7400 },
  { plan_id: 24, provider: "startimes", name: "Super (Dish) — 1 Week", cost: 3300 },
  { plan_id: 25, provider: "startimes", name: "Super (Antenna) — 1 Week", cost: 3200 },
  { plan_id: 26, provider: "startimes", name: "Super (Antenna) — 1 Month", cost: 9500 },
];

export function listDataPlans(network?: Network): DataPlan[] {
  return RAW_DATA
    .filter((p) => !network || p.network === network)
    .map((p) => ({ ...p, price: retail(p.cost, DATA_MARKUP) }))
    .sort((a, b) => a.price - b.price);
}

export function listCablePlans(provider?: CableProvider): CablePlan[] {
  return RAW_CABLE
    .filter((p) => !provider || p.provider === provider)
    .map((p) => ({ ...p, price: retail(p.cost, CABLE_MARKUP) }))
    .sort((a, b) => a.price - b.price);
}

// Generic authenticated request helper for purchase endpoints (used later).
export async function cdhRequest<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const apiKey = process.env.CHEAPDATAHUB_API_KEY;
  if (!apiKey) throw new Error("CHEAPDATAHUB_API_KEY is not configured");
  const res = await fetch(`https://www.cheapdatahub.ng/api/v1/resellers${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const json = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) {
    throw new Error((json as { message?: string })?.message ?? `CheapDataHub error ${res.status}`);
  }
  return json;
}
