import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { PAYDUNYA_API_BASE, getPaydunyaHeaders } from '../../shared/paydunya.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();

    // PayDunya sends response_code "00" for successful payments
    if (body.response_code !== "00") {
      return Response.json({ status: "ignored", reason: "not successful" });
    }

    const data = body.data || {};
    const customData = data.custom_data || {};
    const userId = customData.user_id;
    const diamonds = parseInt(customData.diamonds) || 0;
    const packName = customData.pack_name || "Pack";
    const amount = parseInt(customData.amount) || 0;
    const token = data.token || body.token;

    if (!userId || !diamonds) {
      return Response.json({ status: "ignored", reason: "missing data" });
    }

    // Verify the transaction with PayDunya to confirm it's genuine
    if (token) {
      const verifyResponse = await fetch(`${PAYDUNYA_API_BASE}/checkout-invoice/confirm/${token}`, {
        method: "GET",
        headers: getPaydunyaHeaders(),
      });
      const verifyData = await verifyResponse.json();
      if (verifyData.response_code !== "00") {
        return Response.json({ status: "ignored", reason: "verification failed" });
      }
    }

    // Idempotency: check if this transaction was already processed
    const txRef = `paydunya_${token || body.transaction_id || Date.now()}`;
    const existingTx = await base44.asServiceRole.entities.Transaction.filter({ reference: txRef });
    if (existingTx && existingTx.length > 0) {
      return Response.json({ status: "already_processed" });
    }

    // Get current user balance and credit diamonds
    const userRecord = await base44.asServiceRole.entities.User.get(userId);
    const currentBalance = userRecord?.diamonds || 0;
    const newBalance = currentBalance + diamonds;

    await base44.asServiceRole.entities.User.update(userId, { diamonds: newBalance });

    await base44.asServiceRole.entities.Transaction.create({
      type: "purchase",
      amount: diamonds,
      description: `Achat pack ${packName} via PayDunya`,
      reference: txRef,
      balance_after: newBalance,
      related_generation_id: null,
    });

    return Response.json({
      status: "success",
      diamonds: diamonds,
      newBalance: newBalance,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});