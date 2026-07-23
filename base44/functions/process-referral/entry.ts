import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const REWARD_DIAMONDS = 5;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;

    if (action === "track_click") {
      const { referral_code, source } = body;
      if (!referral_code) {
        return Response.json({ error: "referral_code required" }, { status: 400 });
      }
      // Find referrer by code (service role — public endpoint, no user auth needed)
      const referrers = await base44.asServiceRole.entities.User.filter({ referral_code });
      if (!referrers || referrers.length === 0) {
        return Response.json({ ok: true, matched: false });
      }
      const referrer = referrers[0];
      await base44.asServiceRole.entities.ReferralClick.create({
        referral_code,
        referrer_id: referrer.id,
        source: source || "direct",
      });
      return Response.json({ ok: true, matched: true });
    }

    if (action === "process_reward") {
      // Authenticated — the referred user who just published their first Reel
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

      if (!user.referred_by || user.referral_rewarded) {
        return Response.json({ ok: true, already_rewarded: true });
      }

      // Find referrer by the stored referral code
      const referrers = await base44.asServiceRole.entities.User.filter({ referral_code: user.referred_by });
      if (!referrers || referrers.length === 0) {
        return Response.json({ ok: true, matched: false });
      }
      const referrer = referrers[0];

      // Mark current user as rewarded (user can update self)
      await base44.auth.updateMe({ referral_rewarded: true });

      // Credit referrer with diamonds (service role — admin-level operation)
      const newBalance = (referrer.diamonds || 0) + REWARD_DIAMONDS;
      await base44.asServiceRole.entities.User.update(referrer.id, {
        diamonds: newBalance,
      });

      // Create transaction record for the referrer
      await base44.asServiceRole.entities.Transaction.create({
        type: "referral",
        amount: REWARD_DIAMONDS,
        description: `Parrainage: ${user.username || user.email} a publié son premier projet`,
        reference: `referral_${user.id}`,
        balance_after: newBalance,
        created_by_id: referrer.id,
      });

      // Create notification for the referrer
      await base44.asServiceRole.entities.Notification.create({
        title: "Récompense de parrainage ! 🎉",
        body: `${user.username || "Un filleul"} a publié son premier projet. Vous gagnez ${REWARD_DIAMONDS} 💎 !`,
        type: "referral_reward",
        read: false,
        created_by_id: referrer.id,
      });

      return Response.json({ ok: true, rewarded: true, diamonds: REWARD_DIAMONDS });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});