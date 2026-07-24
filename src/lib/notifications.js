import { base44 } from "@/api/base44Client";

const TYPE_LABELS = {
  like: "like",
  comment: "comment",
  reply: "comment",
  follow: "follow",
  diamonds: "diamonds",
  influencer_published: "influencer_published",
  performance: "performance",
  moderation: "moderation",
  referral_signup: "referral_signup",
  referral_published: "referral_published",
  referral_reward: "referral_reward",
  system: "system",
};

async function isNotificationEnabled(userId, type) {
  // Map notification types to preference types
  const prefType = TYPE_LABELS[type] || type;
  try {
    const prefs = await base44.entities.NotificationPreference.filter({ created_by_id: userId, notification_type: prefType });
    if (prefs && prefs.length > 0) return prefs[0].enabled;
    return true; // default: enabled
  } catch {
    return true;
  }
}

export async function createNotification({ recipientId, type, title, body, sourceUserId = null, reelId = null }) {
  if (!recipientId) return;
  if (recipientId === sourceUserId) return; // don't notify yourself

  const enabled = await isNotificationEnabled(recipientId, type);
  if (!enabled) return;

  try {
    await base44.entities.Notification.create({
      title,
      body,
      type,
      recipient_id: recipientId,
      source_user_id: sourceUserId,
      reel_id: reelId,
      read: false,
      grouped_count: 1,
    });
  } catch { /* ignore */ }
}

// Group notifications client-side for display: returns grouped notifications
export function groupNotifications(notifications) {
  const groups = {};
  const ordered = [];

  for (const n of notifications) {
    const key = n.reel_id ? `${n.type}:${n.reel_id}` : `${n.type}:${n.id}`;
    if (groups[key]) {
      groups[key].grouped_count += n.grouped_count || 1;
      groups[key].read = groups[key].read && n.read;
      // Keep the most recent timestamp
      if (new Date(n.created_date) > new Date(groups[key].created_date)) {
        groups[key].title = n.title;
        groups[key].body = n.body;
        groups[key].created_date = n.created_date;
        groups[key].id = n.id;
      }
    } else {
      groups[key] = { ...n, grouped_count: n.grouped_count || 1 };
      ordered.push(groups[key]);
    }
  }

  // Update titles for grouped notifications
  for (const g of ordered) {
    if (g.grouped_count > 1 && g.reel_id) {
      if (g.type === "like") {
        g.title = `${g.grouped_count} personnes ont aimé votre vidéo`;
      } else if (g.type === "comment") {
        g.title = `${g.grouped_count} nouveaux commentaires sur votre vidéo`;
      } else if (g.type === "follow") {
        g.title = `${g.grouped_count} nouvelles personnes vous suivent`;
      }
    }
  }

  return ordered;
}

export async function markNotificationRead(notificationId) {
  try {
    await base44.entities.Notification.update(notificationId, { read: true });
  } catch { /* ignore */ }
}

export async function markAllNotificationsRead(userId) {
  try {
    const unread = await base44.entities.Notification.filter({ recipient_id: userId, read: false });
    await base44.entities.Notification.bulkUpdate(
      (unread || []).map(n => ({ id: n.id, read: true }))
    );
  } catch { /* ignore */ }
}

export async function getNotificationPreferences(userId) {
  try {
    return await base44.entities.NotificationPreference.filter({ created_by_id: userId });
  } catch {
    return [];
  }
}

export async function toggleNotificationPreference(userId, type, enabled) {
  try {
    const existing = await base44.entities.NotificationPreference.filter({ created_by_id: userId, notification_type: type });
    if (existing && existing.length > 0) {
      await base44.entities.NotificationPreference.update(existing[0].id, { enabled });
    } else {
      await base44.entities.NotificationPreference.create({ notification_type: type, enabled });
    }
  } catch { /* ignore */ }
}