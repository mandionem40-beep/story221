import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { PAYDUNYA_API_BASE, getPaydunyaHeaders } from "../../shared/paydunya.ts";

Deno.serve(async (req) => {
  try {
    let payload;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      const formData = await req.formData();
      payload = Object.fromEntries(formData);
    }

    // PayDunya sends response_code "00" for successful payments
    if (payload.response_code !== "00") {
      return Response.json({ status: "ignored", reason: "payment not successful" });
    }

    const data = payload.data || {};
    const customData = data.custom_data || {};
    const invoiceData = data.invoice || {};

    const userId = customData.user_id;
    const diamonds = parseInt(customData.diamonds) || 0;
    const packName = customData.pack_name || "Pack diamants";
    const amount = parseInt(customData.amount) || 0;
    const token = invoiceData.token || payload.token || "";

    if (!userId || diamonds <= 0) {
      return Response.json({ status: "ignored", reason: "missing user_id or diamonds" });
    }

    // CRITICAL SECURITY: Verify the payment with PayDunya before crediting
    if (token) {
      const confirmRes = await fetch(`${PAYDUNYA_API_BASE}/checkout-invoice/confirm/${token}`, {
        method: "POST",
        headers: getPaydunyaHeaders(),
      });
      const confirmData = await confirmRes.json();

      if (confirmData.response_code !== "00" || confirmData.status !== "completed") {
        return Response.json({ status: "ignored", reason: "payment verification failed" });
      }

      // Verify the amount matches what was charged
      const confirmedAmount = parseInt(confirmData.invoice?.total_amount) || 0;
      if (confirmedAmount !== amount) {
        return Response.json({ status: "ignored", reason: "amount mismatch" });
      }
    } else {
      return Response.json({ status: "ignored", reason: "missing token" });
    }

    const base44 = createClientFromRequest(req);

    // Prevent duplicate crediting
    const reference = `paydunya_${token}`;
    const existing = await base44.asServiceRole.entities.Transaction.filter({ reference });
    if (existing && existing.length > 0) {
      return Response.json({ status: "duplicate", message: "Transaction already processed" });
    }

    // Credit diamonds to user
    let user;
    try {
      user = await base44.asServiceRole.entities.User.get(userId);
    } catch {
      return Response.json({ status: "error", reason: "user not found" });
    }
    if (!user) {
      return Response.json({ status: "error", reason: "user not found" });
    }

    const newBalance = (user.diamonds || 0) + diamonds;
    await base44.asServiceRole.entities.User.update(userId, { diamonds: newBalance });

    // Create transaction record
    await base44.asServiceRole.entities.Transaction.create({
      type: "purchase",
      amount: diamonds,
      description: `Achat pack ${packName} (${amount} FCFA)`,
      reference: reference,
      balance_after: newBalance,
      created_by_id: userId,
    });

    return Response.json({
      status: "success",
      diamonds_credited: diamonds,
      new_balance: newBalance,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});