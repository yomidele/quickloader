import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Transaction {
  id: string;
  user_id: string;
  service_type: 'wallet' | 'airtime' | 'data' | 'dstv' | 'electricity';
  amount: number;
  reference: string;
  status: 'success' | 'failed' | 'pending';
  metadata: Record<string, any>;
  created_at: string;
}

export async function saveTransaction(
  userId: string,
  serviceType: Transaction['service_type'],
  amount: number,
  reference: string,
  status: 'success' | 'failed' | 'pending',
  metadata: Record<string, any>
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: userId,
        service_type: serviceType,
        amount,
        reference,
        status,
        metadata,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addToWallet(userId: string, amount: number): Promise<void> {
  const { error } = await supabase.rpc('add_to_wallet', {
    user_id: userId,
    amount,
  });

  if (error) throw error;
}

export async function getUserByEmail(email: string): Promise<{ id: string } | null> {
  const { data, error } = await supabase.auth.admin.getUserById(email);
  if (error) return null;
  return { id: data?.user?.id || '' };
}

export async function getWalletBalance(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_wallet_balance', {
    user_id: userId,
  });

  if (error) throw error;
  return data || 0;
}

export async function deductFromWallet(userId: string, amount: number): Promise<boolean> {
  const { data, error } = await supabase.rpc('deduct_from_wallet', {
    user_id: userId,
    amount,
  });

  if (error) throw error;
  return data === true;
}

export async function refundToWallet(userId: string, amount: number): Promise<void> {
  const { error } = await supabase.rpc('refund_to_wallet', {
    user_id: userId,
    amount,
  });

  if (error) throw error;
}

export async function updateTransactionStatus(
  transactionId: string,
  status: 'success' | 'failed' | 'pending',
  metadata?: Record<string, any>
): Promise<void> {
  const updateData: any = { status };
  if (metadata) {
    updateData.metadata = metadata;
  }

  const { error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', transactionId);

  if (error) throw error;
}
