// Purchase data via Ogdams SimHosting Data Vending API.
// POST https://simhosting.ogdams.ng/api/v1/vend/data
// Test mode: no wallet balance check, no deduction. Transaction is recorded.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://esm.sh/zod@3.23.8';

const NETWORK_ID: Record<string, number> = {
  mtn: 1,
  airtel: 2,
  glo: 3,
  '9mobile': 4,
};

const BodySchema = z.object({
  network: z.string(),                // 'mtn' | 'airtel' | 'glo' | '9mobile'
  planId: z.number().int().positive(), // Ogdams planId
  phone: z.string().min(10).max(15),
  amount: z.number().positive(),       // charged price shown to user
  metadata: z.record(z.any()).optional(),
});

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('234')) return digits;
  if (digits.startsWith('0')) return '234' + digits.slice(1);
  if (digits.length === 10) return '234' + digits;
  return digits;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('OGDAMS_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OGDAMS_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { network, planId, phone, amount, metadata } = parsed.data;
    const networkId = NETWORK_ID[network.toLowerCase()];
    if (!networkId) {
      return new Response(JSON.stringify({ error: 'Unsupported network' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const phoneNumber = normalizePhone(phone);
    const reference = `OGD|${userId.slice(0, 8)}|${Date.now()}|${Math.floor(Math.random() * 9999)}`;

    // Call Ogdams
    const ogRes = await fetch('https://simhosting.ogdams.ng/api/v1/vend/data', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ networkId, planId, phoneNumber, reference }),
    });
    const rawText = await ogRes.text();
    let ogBody: any;
    try { ogBody = JSON.parse(rawText); } catch { ogBody = { raw: rawText }; }

    // 200 = success, 201/202 = queued/processing, 424 = failed
    const code = Number(ogBody?.code ?? ogRes.status);
    const success = ogBody?.status === true && (code === 200 || code === 201 || code === 202);
    const status = code === 200 ? 'success' : (code === 201 || code === 202) ? 'pending' : 'failed';

    // Record transaction via service role
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: tx, error: insErr } = await admin
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'data',
        service_type: 'data',
        description: `Data purchase (${network.toUpperCase()})`,
        charged_price: amount,
        status,
        reference,
        metadata: {
          ...metadata,
          purchaseType: 'wallet',
          provider: 'ogdams',
          testMode: true,
          ogdamsCode: code,
          ogdamsMessage: ogBody?.data?.msg || ogBody?.message,
          networkId,
          planId,
          phoneNumber,
          completedAt: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (insErr) {
      console.error('tx insert error', insErr);
    }

    return new Response(JSON.stringify({
      success,
      status,
      reference,
      ogdams: { code, message: ogBody?.data?.msg || ogBody?.message, raw: ogBody },
      transaction: tx ? {
        id: tx.id,
        amount: Number(tx.charged_price),
        reference: tx.reference,
        status: tx.status,
      } : null,
    }), {
      status: success ? 200 : (status === 'pending' ? 202 : 400),
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('ogdams-purchase-data error', err);
    return new Response(JSON.stringify({ error: err?.message || 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
