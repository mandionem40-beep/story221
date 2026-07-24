// Credit Service - Gestion sécurisée des diamants (débit, remboursement, calcul de coût)

const BASE_COSTS = {
  video: 10, film: 15, serie: 15, anime: 12, cartoon: 12,
  ad: 20, story: 5, storyboard: 3, character: 5,
  voice: 3, music_clip: 8, image: 2,
};

export function calculateCost(type, duration) {
  const base = BASE_COSTS[type] || 10;
  return base * Math.max(1, duration);
}

export async function deductCredits(base44, userId, generationId, cost) {
  const freshUser = await base44.asServiceRole.entities.User.get(userId);
  if (!freshUser) throw new Error("Utilisateur introuvable");
  if (freshUser.account_status === "banned" || freshUser.account_status === "suspended") {
    throw new Error("Compte suspendu");
  }

  // Prevent double deduction
  const existingTx = await base44.asServiceRole.entities.Transaction.filter({
    reference: `gen_${generationId}`,
  });
  if (existingTx && existingTx.length > 0) {
    return { already_deducted: true, newBalance: freshUser.diamonds || 0, usedFreeTrial: false };
  }

  const currentDiamonds = freshUser.diamonds || 0;
  const FREE_TRIAL_MAX_COST = 10; // 1 minute max
  const freeTrialAvailable = !freshUser.free_trial_used && cost > 0;
  const freeTrialCover = freeTrialAvailable ? Math.min(cost, FREE_TRIAL_MAX_COST) : 0;
  const remainingCost = cost - freeTrialCover;

  if (currentDiamonds < remainingCost) {
    throw new Error("Solde insuffisant");
  }

  const newBalance = currentDiamonds - remainingCost;

  await base44.asServiceRole.entities.User.update(userId, {
    diamonds: newBalance,
    free_trial_used: freeTrialAvailable ? true : freshUser.free_trial_used,
  });

  await base44.asServiceRole.entities.Transaction.create({
    type: freeTrialAvailable ? "free_trial" : "generation",
    amount: -remainingCost,
    description: `Génération ${generationId}${freeTrialCover > 0 ? ` (essai gratuit: ${freeTrialCover} 💎)` : ""}`,
    reference: `gen_${generationId}`,
    balance_after: newBalance,
    created_by_id: userId,
  });

  return { newBalance, usedFreeTrial: freeTrialAvailable, freeTrialCover };
}

export async function refundCredits(base44, userId, generationId, cost) {
  // Prevent double refund
  const existingRefund = await base44.asServiceRole.entities.Transaction.filter({
    reference: `refund_${generationId}`,
  });
  if (existingRefund && existingRefund.length > 0) {
    return { already_refunded: true };
  }

  const freshUser = await base44.asServiceRole.entities.User.get(userId);
  if (!freshUser) throw new Error("Utilisateur introuvable");

  const newBalance = (freshUser.diamonds || 0) + cost;

  await base44.asServiceRole.entities.User.update(userId, {
    diamonds: newBalance,
  });

  await base44.asServiceRole.entities.Transaction.create({
    type: "admin_adjustment",
    amount: cost,
    description: `Remboursement: génération échouée ${generationId}`,
    reference: `refund_${generationId}`,
    balance_after: newBalance,
    created_by_id: userId,
  });

  return { newBalance };
}

export async function sendNotification(base44, userId, title, body, type) {
  try {
    await base44.asServiceRole.entities.Notification.create({
      title,
      body,
      type: type || "system",
      created_by_id: userId,
    });
  } catch { /* notifications are non-critical */ }
}