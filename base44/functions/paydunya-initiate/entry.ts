import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { PAYDUNYA_API_BASE, getPaydunyaHeaders, getIpnCallbackUrl, getAppOrigin } from "../../shared/paydunya.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { packId, packName, diamonds, amount } = body;

    if (!diamonds || !amount) {
      return Response.json({ error: 'Missing required fields: diamonds, amount' }, { status: 400 });
    }

    const appOrigin = getAppOrigin(req);

    const invoiceData = {
      invoice: {
        total_amount: amount,
        description: `Achat de ${diamonds} diamants - ${packName || "Pack"}`,
      },
      store: {
        name: "Story221",
        website_url: appOrigin,
      },
      actions: {
        cancel_url: `${appOrigin}/app/diamonds`,
        return_url: `${appOrigin}/app/diamonds?status=success`,
        callback_url: getIpnCallbackUrl(),
      },
      custom_data: {
        user_id: user.id,
        pack_id: packId || "",
        diamonds: diamonds,
        pack_name: packName || "",
        amount: amount,
      },
    };

    const response = await fetch(`${PAYDUNYA_API_BASE}/checkout-invoice/create`, {
      method: "POST",
      headers: getPaydunyaHeaders(),
      body: JSON.stringify(invoiceData),
    });

    const result = await response.json();

    if (result.response_code === "00") {
      return Response.json({
        checkoutUrl: result.response_text,
        token: result.token,
      });
    } else {
      return Response.json({
        error: result.response_text || "Failed to create PayDunya invoice",
      }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});