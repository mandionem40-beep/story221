import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { generationId, cost } = body;

    if (!generationId || typeof cost !== 'number' || cost < 0) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Fetch fresh user data from service role to prevent race conditions and tampering
    const freshUser = await base44.asServiceRole.entities.User.get(user.id);
    if (!freshUser) return Response.json({ error: 'User not found' }, { status: 404 });

    // Check if user is suspended/banned
    if (freshUser.account_status === 'banned' || freshUser.account_status === 'suspended') {
      return Response.json({ error: 'Compte suspendu' }, { status: 403 });
    }

    const currentDiamonds = freshUser.diamonds || 0;
    const freeTrialAvailable = !freshUser.free_trial_used && cost > 0;

    if (!freeTrialAvailable && currentDiamonds < cost) {
      return Response.json({ error: 'Solde insuffisant' }, { status: 400 });
    }

    const newBalance = freeTrialAvailable ? currentDiamonds : currentDiamonds - cost;

    await base44.asServiceRole.entities.User.update(user.id, {
      diamonds: newBalance,
      free_trial_used: freeTrialAvailable ? true : freshUser.free_trial_used,
    });

    await base44.asServiceRole.entities.Transaction.create({
      type: freeTrialAvailable ? 'free_trial' : 'generation',
      amount: -cost,
      description: `Génération ${generationId}`,
      reference: `gen_${generationId}`,
      balance_after: newBalance,
      created_by_id: user.id,
    });

    return Response.json({
      success: true,
      newBalance,
      usedFreeTrial: freeTrialAvailable,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});