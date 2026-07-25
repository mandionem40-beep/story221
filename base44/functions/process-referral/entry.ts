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

    if (action === "get_stats") {
      // Authenticated — return referral stats for the current user
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

      const referralCode = user.referral_code;
      if (!referralCode) {
        return Response.json({ clicks: 0, signups: 0, published: 0, rewards: 0, pendingRewards: 0, referrals: [] });
      }

      // Count clicks (service role — bypasses RLS)
      const clicks = await base44.asServiceRole.entities.ReferralClick.filter({ referrer_id: user.id });

      // Find all users referred by this code (service role — regular users can't list other users)
      const allUsers = await base44.asServiceRole.entities.User.filter({ referred_by: referralCode });
      const myReferrals = allUsers || [];
      const referralUserIds = new Set(myReferrals.map(u => u.id));

      // Find reels published by referred users
      let publishedReels = [];
      if (referralUserIds.size > 0) {
        const allReels = await base44.asServiceRole.entities.Reel.list("-created_date", 500);
        publishedReels = (allReels || []).filter(r => referralUserIds.has(r.created_by_id));
      }
      const publishedUserIds = new Set(publishedReels.map(r => r.created_by_id));
      const publishedCount = publishedUserIds.size;

      const rewardsEarned = publishedCount * REWARD_DIAMONDS;
      const pendingRewards = (myReferrals.length - publishedCount) * REWARD_DIAMONDS;

      // Build referral history
      const reelsByCreator = {};
      publishedReels.forEach(r => {
        if (!reelsByCreator[r.created_by_id]) reelsByCreator[r.created_by_id] = [];
        reelsByCreator[r.created_by_id].push(r);
      });

      const history = myReferrals.map(u => {
        const userReels = reelsByCreator[u.id] || [];
        const hasPublished = userReels.length > 0;
        return {
          id: u.id,
          username: u.username || u.email?.split("@")[0] || "utilisateur",
          avatar: u.avatar_url,
          joinedDate: u.created_date,
          status: hasPublished ? "published" : "signup",
          publishedCount: userReels.length,
        };
      }).sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate));

      return Response.json({
        clicks: clicks?.length || 0,
        signups: myReferrals.length,
        published: publishedCount,
        rewards: rewardsEarned,
        pendingRewards: pendingRewards > 0 ? pendingRewards : 0,
        referrals: history,
      });
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
        recipient_id: referrer.id,
        source_user_id: user.id,
        created_by_id: referrer.id,
      });

      return Response.json({ ok: true, rewarded: true, diamonds: REWARD_DIAMONDS });
    }

    if (action === "track_signup") {
      // Authenticated — the newly registered user with a referred_by code
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

      if (!user.referred_by) {
        return Response.json({ ok: true, matched: false });
      }

      // Find referrer by the stored referral code
      const referrers = await base44.asServiceRole.entities.User.filter({ referral_code: user.referred_by });
      if (!referrers || referrers.length === 0) {
        return Response.json({ ok: true, matched: false });
      }
      const referrer = referrers[0];

      // Notify the referrer that someone signed up with their code
      await base44.asServiceRole.entities.Notification.create({
        title: "Nouveau filleul ! 🎉",
        body: `${user.username || user.email?.split("@")[0] || "Quelqu'un"} s'est inscrit avec votre lien de parrainage.`,
        type: "referral_signup",
        read: false,
        recipient_id: referrer.id,
        source_user_id: user.id,
        created_by_id: referrer.id,
      });

      return Response.json({ ok: true, matched: true });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});