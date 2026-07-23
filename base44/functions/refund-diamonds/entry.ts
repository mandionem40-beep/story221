import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { generationId, cost } = body;

    if (!generationId || typeof cost !== 'number' || cost <= 0) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Prevent double refund
    const existingRefund = await base44.asServiceRole.entities.Transaction.filter({
      reference: `refund_${generationId}`,
    });
    if (existingRefund && existingRefund.length > 0) {
      return Response.json({ ok: true, already_refunded: true });
    }

    // Fetch fresh user data
    const freshUser = await base44.asServiceRole.entities.User.get(user.id);
    if (!freshUser) return Response.json({ error: 'User not found' }, { status: 404 });

    const newBalance = (freshUser.diamonds || 0) + cost;

    await base44.asServiceRole.entities.User.update(user.id, {
      diamonds: newBalance,
    });

    await base44.asServiceRole.entities.Transaction.create({
      type: 'admin_adjustment',
      amount: cost,
      description: `Remboursement: génération échouée ${generationId}`,
      reference: `refund_${generationId}`,
      balance_after: newBalance,
      created_by_id: user.id,
    });

    return Response.json({ success: true, newBalance });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});