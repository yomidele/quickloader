import axios from 'axios';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    status: 'success' | 'failed' | 'pending';
    paid_at: string;
    customer: {
      id: number;
      email: string;
    };
    metadata: Record<string, any>;
  };
}

const paystackClient = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  },
});

export async function initializePaystack(
  email: string,
  amount: number,
  metadata: Record<string, any>
): Promise<PaystackInitResponse> {
  const response = await paystackClient.post<PaystackInitResponse>('/transaction/initialize', {
    email,
    amount: Math.round(amount * 100), // Paystack uses kobo (100 kobo = 1 naira)
    metadata,
  });
  return response.data;
}

export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResponse> {
  const response = await paystackClient.get<PaystackVerifyResponse>(
    `/transaction/verify/${reference}`
  );
  return response.data;
}
