import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = base44.asServiceRole;
    const now = new Date();
    const results = { processed: 0, sent: 0, conversionsUpdated: 0 };

    // 1. Process scheduled campaigns that are due
    const scheduledCampaigns = await admin.entities.Campaign.filter({ status: 'scheduled' });
    for (const campaign of scheduledCampaigns) {
      if (!campaign.scheduled_date || new Date(campaign.scheduled_date) > now) continue;

      // Find target users based on audience
      let targetUsers = [];
      const allUsers = await admin.entities.User.list('-created_date', 500);

      if (campaign.audience_type === 'all') {
        targetUsers = allUsers;
      } else if (campaign.audience_type === 'group') {
        const group = campaign.audience_criteria;
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (group === 'all') targetUsers = allUsers;
        else if (group === 'new') targetUsers = allUsers.filter((u) => u.created_date && new Date(u.created_date) > sevenDaysAgo);
        else if (group === 'inactive_30') targetUsers = allUsers.filter((u) => !u.last_login || new Date(u.last_login) < thirtyDaysAgo);
        else if (group === 'active') targetUsers = allUsers.filter((u) => u.last_login && new Date(u.last_login) > sevenDaysAgo);
        else if (group === 'no_credits') targetUsers = allUsers.filter((u) => (u.diamonds || 0) === 0);
        else if (group === 'never_purchased') targetUsers = allUsers.filter((u) => !u.has_purchased);
        else if (group === 'premium') targetUsers = allUsers.filter((u) => u.is_premium);
        else targetUsers = allUsers;
      } else if (campaign.audience_type === 'specific') {
        let selectedIds = [];
        try { selectedIds = JSON.parse(campaign.audience_criteria || '[]'); } catch { selectedIds = []; }
        targetUsers = allUsers.filter((u) => selectedIds.includes(u.id));
      }

      if (targetUsers.length === 0) {
        await admin.entities.Campaign.update(campaign.id, { status: 'sent', sent_count: 0 });
        results.processed++;
        continue;
      }

      // Create conversations + messages in batches
      const batchSize = 20;
      for (let i = 0; i < targetUsers.length; i += batchSize) {
        const batch = targetUsers.slice(i, i + batchSize);
        const convs = await admin.entities.Conversation.bulkCreate(
          batch.map((u) => ({
            subject: campaign.title,
            category: 'other',
            type: 'campaign',
            status: 'open',
            campaign_id: campaign.id,
            owner_id: u.id,
            last_message_at: now.toISOString(),
            unread_count: 1,
          }))
        );
        const messages = convs.map((conv) => ({
          conversation_id: conv.id,
          content: campaign.content,
          sender_role: 'admin',
          owner_id: conv.owner_id,
          read: false,
        }));
        await admin.entities.Message.bulkCreate(messages);
      }

      await admin.entities.Campaign.update(campaign.id, {
        status: 'sent',
        sent_count: targetUsers.length,
      });
      results.processed++;
      results.sent += targetUsers.length;
    }

    // 2. Update conversion counts for sent campaigns
    const sentCampaigns = await admin.entities.Campaign.filter({ status: 'sent' });
    const allTransactions = await admin.entities.Transaction.filter({ type: 'purchase' });

    for (const campaign of sentCampaigns) {
      const sentDate = new Date(campaign.created_date);
      // Count recipients who made a purchase after the campaign was sent
      let conversions = 0;
      // Get conversations for this campaign
      const campaignConvs = await admin.entities.Conversation.filter({ campaign_id: campaign.id });
      const recipientIds = new Set(campaignConvs.map((c) => c.owner_id));

      for (const tx of allTransactions) {
        if (recipientIds.has(tx.created_by_id) && new Date(tx.created_date) > sentDate) {
          conversions++;
        }
      }

      if (conversions !== (campaign.conversion_count || 0)) {
        await admin.entities.Campaign.update(campaign.id, { conversion_count: conversions });
        results.conversionsUpdated++;
      }
    }

    return Response.json({ success: true, ...results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});