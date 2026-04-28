// 202BBQ Deposit Checkout Worker
// Receives a cart subtotal, creates a Stripe Checkout Session for 50%, returns the URL.

const ALLOWED_ORIGINS = [
  'https://202barbecue.com',
  'https://www.202barbecue.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
];

const MIN_DEPOSIT_CENTS = 100;       // Stripe minimum is $0.50; we set $1.00 floor.
const MAX_DEPOSIT_CENTS = 1_000_00;  // $1,000 cap as a safety rail.

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin);
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON body' }, 400, corsHeaders);
    }

    const subtotal = Number(body?.subtotal);
    const orderRef = typeof body?.orderRef === 'string' ? body.orderRef.slice(0, 64) : '';
    const email    = typeof body?.email    === 'string' ? body.email.slice(0, 200)   : '';

    if (!Number.isFinite(subtotal) || subtotal <= 0) {
      return jsonResponse({ error: 'Invalid subtotal' }, 400, corsHeaders);
    }

    const depositCents = Math.round(subtotal * 50); // subtotal is in dollars; *100/2 = *50
    if (depositCents < MIN_DEPOSIT_CENTS) {
      return jsonResponse({ error: 'Deposit amount too small' }, 400, corsHeaders);
    }
    if (depositCents > MAX_DEPOSIT_CENTS) {
      return jsonResponse({ error: 'Deposit exceeds maximum allowed' }, 400, corsHeaders);
    }

    const params = new URLSearchParams();
    params.set('mode', 'payment');
    params.append('payment_method_types[]', 'card');
    params.set('line_items[0][quantity]', '1');
    params.set('line_items[0][price_data][currency]', 'usd');
    params.set('line_items[0][price_data][unit_amount]', String(depositCents));
    params.set('line_items[0][price_data][product_data][name]', '202BBQ Order Deposit (50%)');
    params.set(
      'line_items[0][price_data][product_data][description]',
      `50% deposit${orderRef ? ` for order ${orderRef}` : ''}. Remainder due at pickup or delivery.`
    );
    params.set('success_url', env.SUCCESS_URL || 'https://202barbecue.com/?deposit=success');
    params.set('cancel_url',  env.CANCEL_URL  || 'https://202barbecue.com/?deposit=cancel');
    if (email)    params.set('customer_email', email);
    if (orderRef) params.set('client_reference_id', orderRef);
    if (orderRef) params.set('metadata[order_ref]', orderRef);
    params.set('metadata[subtotal_usd]', subtotal.toFixed(2));
    params.set('metadata[deposit_pct]',  '50');

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!stripeRes.ok) {
      const errText = await stripeRes.text();
      console.error('Stripe error', stripeRes.status, errText);
      return jsonResponse({ error: 'Could not start payment session' }, 502, corsHeaders);
    }

    const session = await stripeRes.json();
    return jsonResponse({ url: session.url, id: session.id }, 200, corsHeaders);
  },
};

function jsonResponse(data, status, extraHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}
