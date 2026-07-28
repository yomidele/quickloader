// Fetch live data plans from Ogdams SimHosting.
// GET https://simhosting.ogdams.ng/api/v4/get/data/plans
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const PLATFORM_MARKUP = 50; // flat ₦50 markup

// Ogdams network IDs: MTN=1, AIRTEL=2, GLO=3, 9MOBILE=4
const NETWORK_ID: Record<string, number> = {
  mtn: 1,
  airtel: 2,
  glo: 3,
  '9mobile': 4,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get('OGDAMS_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OGDAMS_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const networkParam = (url.searchParams.get('network') || '').toLowerCase();
    const wantedNetworkId = NETWORK_ID[networkParam];

    const res = await fetch('https://simhosting.ogdams.ng/api/v4/get/data/plans', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });

    const raw = await res.text();
    let body: any;
    try { body = JSON.parse(raw); } catch { body = { raw }; }

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Ogdams plans fetch failed', status: res.status, body }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Ogdams returns { status, code, data: [...] } typically. Normalize.
    const raws: any[] = Array.isArray(body?.data) ? body.data
      : Array.isArray(body) ? body
      : Array.isArray(body?.plans) ? body.plans
      : [];

    const networkNameById: Record<number, string> = { 1: 'mtn', 2: 'airtel', 3: 'glo', 4: '9mobile' };

    const plans = raws.map((p: any) => {
      const networkId = Number(p.networkId ?? p.network_id ?? p.network ?? 0);
      const cost = Number(p.amount ?? p.price ?? p.cost ?? 0);
      return {
        plan_id: Number(p.planId ?? p.plan_id ?? p.id ?? 0),
        networkId,
        network: networkNameById[networkId] || 'mtn',
        size: String(p.size ?? p.plan_size ?? p.name ?? '').trim(),
        validity: String(p.validity ?? p.duration ?? '').trim(),
        type: String(p.type ?? p.plan_type ?? p.category ?? '').trim(),
        cost,
        price: cost + PLATFORM_MARKUP,
      };
    }).filter((p) => p.plan_id > 0 && p.cost > 0);

    const filtered = wantedNetworkId
      ? plans.filter((p) => p.networkId === wantedNetworkId)
      : plans;
    filtered.sort((a, b) => a.price - b.price);

    return new Response(JSON.stringify({ plans: filtered }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
