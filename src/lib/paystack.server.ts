// Server-only Paystack helpers. Never import from client code.
import { createHmac, timingSafeEqual } from "node:crypto";

export const FUNDING_FEE = 35;
export const MIN_FUND_AMOUNT = 200;

function getSecret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

export interface PaystackInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializePaystack(args: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitResponse> {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: args.email,
      amount: args.amountKobo,
      reference: args.reference,
      callback_url: args.callbackUrl,
      metadata: args.metadata,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    status?: boolean;
    message?: string;
    data?: PaystackInitResponse;
  };
  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message ?? `Paystack init failed (${res.status})`);
  }
  return json.data;
}

export async function verifyPaystackTransaction(reference: string): Promise<{
  status: string;
  amount: number; // in kobo
  reference: string;
}> {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${getSecret()}` } },
  );
  const json = (await res.json().catch(() => ({}))) as {
    status?: boolean;
    data?: { status: string; amount: number; reference: string };
    message?: string;
  };
  if (!res.ok || !json.status || !json.data) {
    throw new Error(json.message ?? `Paystack verify failed (${res.status})`);
  }
  return json.data;
}

export function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", getSecret()).update(rawBody).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
