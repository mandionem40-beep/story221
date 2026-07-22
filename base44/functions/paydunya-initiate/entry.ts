import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { PAYDUNYA_API_BASE, getPaydunyaHeaders } from '../../shared/paydunya.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { packId, packName, diamonds, amount } = await req.json();

    if (!packId || !diamonds || !amount) {
      return Response.json({ error: 'Missing pack information' }, { status: 400 });
    }

    const origin = req.headers.get("origin") || req.headers.get("referer") || "https://story221.com";
    const appId = Deno.env.get("BASE44_APP_ID");
    const callbackUrl = `https://api.base44.com/v1/apps/${appId}/functions/paydunya-ipn`;

    const body = {
      invoice: {
        total_amount: amount,
        description: `Achat de ${diamonds} diamants - Pack ${packName}`,
      },
      store: {
        name: "Story221",
        website_url: origin,
        logo_url: "",
      },
      actions: {
        cancel_url: `${origin}/app/diamonds?status=cancel`,
        return_url: `${origin}/app/diamonds?status=success`,
        callback_url: callbackUrl,
      },
      custom_data: {
        user_id: user.id,
        pack_id: packId,
        diamonds: diamonds,
        pack_name: packName,
        amount: amount,
      },
    };

    const response = await fetch(`${PAYDUNYA_API_BASE}/checkout-invoice/create`, {
      method: "POST",
      headers: getPaydunyaHeaders(),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.response_code === "00") {
      return Response.json({
        checkoutUrl: data.response_text,
        token: data.token,
      });
    } else {
      return Response.json({
        error: data.response_text || "PayDunya error",
        code: data.response_code,
      }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});