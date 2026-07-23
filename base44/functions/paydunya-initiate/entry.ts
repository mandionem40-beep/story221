import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { PAYDUNYA_API_BASE, getPaydunyaHeaders, getIpnCallbackUrl, getAppOrigin } from "../../shared/paydunya.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { packId } = body;

    if (!packId) {
      return Response.json({ error: 'packId requis' }, { status: 400 });
    }

    // SECURITY: Look up pack from database — never trust client-sent prices
    let pack;
    try {
      pack = await base44.asServiceRole.entities.DiamondPack.get(packId);
    } catch {
      return Response.json({ error: 'Pack introuvable' }, { status: 404 });
    }
    if (!pack || !pack.active) {
      return Response.json({ error: 'Pack introuvable ou inactif' }, { status: 404 });
    }

    const appOrigin = getAppOrigin(req);

    const invoiceData = {
      invoice: {
        total_amount: pack.price_fcfa,
        description: `Achat de ${pack.diamonds} diamants - ${pack.name}`,
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
        pack_id: pack.id,
        diamonds: pack.diamonds,
        pack_name: pack.name,
        amount: pack.price_fcfa,
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