import { base44 } from "@/api/base44Client";

const DEFAULT_RATIOS = { trending: 30, fresh: 25, personalized: 25, followed: 20 };
const PAGE_SIZE = 8;

export async function getFeedRatios() {
  try {
    const settings = await base44.entities.SiteContent.filter({ category: "general" });
    const get = (key, def) => {
      const s = settings?.find(s => s.key === key);
      const v = s ? parseInt(s.value) : def;
      return isNaN(v) ? def : v;
    };
    return {
      trending: get("feed_ratio_trending", DEFAULT_RATIOS.trending),
      fresh: get("feed_ratio_fresh", DEFAULT_RATIOS.fresh),
      personalized: get("feed_ratio_personalized", DEFAULT_RATIOS.personalized),
      followed: get("feed_ratio_followed", DEFAULT_RATIOS.followed),
    };
  } catch {
    return { ...DEFAULT_RATIOS };
  }
}

export async function updateTrendingScore(reelId) {
  try {
    const [likes, comments, reel] = await Promise.all([
      base44.entities.Like.filter({ reel_id: reelId }),
      base44.entities.Comment.filter({ reel_id: reelId }),
      base44.entities.Reel.get(reelId),
    ]);
    const visibleComments = (comments || []).filter(c => !c.hidden).length;
    const score = (likes.length * 3) + (visibleComments * 2) + ((reel.share_count || 0) * 2) + ((reel.views || 0) * 0.1);
    await base44.entities.Reel.update(reelId, { trending_score: Math.round(score) });
  } catch { /* ignore */ }
}

export async function trackInteraction(reelId, interactionType, reelAuthorId) {
  try {
    await base44.entities.InteractionHistory.create({
      reel_id: reelId,
      interaction_type: interactionType,
      reel_author_id: reelAuthorId || null,
    });
  } catch { /* ignore */ }
}

async function fetchTrending(count, offset) {
  const limit = Math.max(count, offset + count);
  const data = await base44.entities.Reel.filter({ hidden: false }, "-trending_score", limit);
  return (data || []).slice(offset, offset + count);
}

async function fetchFresh(count, offset) {
  const limit = Math.max(count, offset + count);
  const data = await base44.entities.Reel.filter({ hidden: false }, "-created_date", limit);
  return (data || []).slice(offset, offset + count);
}

async function fetchFollowed(userId, count, offset) {
  const follows = await base44.entities.Follow.filter({ created_by_id: userId });
  const followedIds = (follows || []).map(f => f.followed_id);
  if (followedIds.length === 0) return [];
  const limit = Math.max(count, offset + count);
  const data = await base44.entities.Reel.filter({ hidden: false, created_by_id: { $in: followedIds } }, "-created_date", limit);
  return (data || []).slice(offset, offset + count);
}

async function fetchPersonalized(userId, count, offset) {
  // Get authors the user has interacted with
  const history = await base44.entities.InteractionHistory.filter({ created_by_id: userId }, "-created_date", 50);
  const authorIds = [...new Set((history || []).map(h => h.reel_author_id).filter(Boolean))];
  // Get reels the user has already liked/favorited (to exclude)
  const [likes, favs] = await Promise.all([
    base44.entities.Like.filter({ created_by_id: userId }),
    base44.entities.Favorite.filter({ created_by_id: userId }),
  ]);
  const excludedIds = new Set([
    ...(likes || []).map(l => l.reel_id),
    ...(favs || []).map(f => f.reel_id),
  ]);

  if (authorIds.length > 0) {
    const data = await base44.entities.Reel.filter({ hidden: false, created_by_id: { $in: authorIds } }, "-trending_score", 30);
    const filtered = (data || []).filter(r => !excludedIds.has(r.id));
    return filtered.slice(offset, offset + count);
  }
  // Fallback: recent reels not yet interacted with
  const data = await base44.entities.Reel.filter({ hidden: false }, "-created_date", 30);
  const filtered = (data || []).filter(r => !excludedIds.has(r.id));
  return filtered.slice(offset, offset + count);
}

function interleave(arrays) {
  const result = [];
  const maxLen = Math.max(...arrays.map(a => a.length));
  for (let i = 0; i < maxLen; i++) {
    for (const arr of arrays) {
      if (arr[i]) result.push(arr[i]);
    }
  }
  return result;
}

export async function fetchFeed({ userId, page = 0, pageSize = PAGE_SIZE, feedType = "foryou", ratios }) {
  const offset = page * pageSize;
  const r = ratios || DEFAULT_RATIOS;

  try {
    if (feedType === "trending") {
      return await fetchTrending(pageSize, offset);
    }
    if (feedType === "following") {
      return await fetchFollowed(userId, pageSize, offset);
    }
    if (feedType === "discover") {
      // Reels from creators with good engagement but not yet followed
      const [allReels, follows] = await Promise.all([
        base44.entities.Reel.filter({ hidden: false }, "-trending_score", 50),
        base44.entities.Follow.filter({ created_by_id: userId }),
      ]);
      const followedIds = new Set((follows || []).map(f => f.followed_id));
      const myReels = new Set();
      const candidates = (allReels || []).filter(r => {
        if (followedIds.has(r.created_by_id) || r.created_by_id === userId) return false;
        // Only show one reel per author (to diversify)
        if (myReels.has(r.created_by_id)) return false;
        myReels.add(r.created_by_id);
        return true;
      });
      return candidates.slice(offset, offset + pageSize);
    }

    // "foryou" — mix the 4 types
    const tCount = Math.round(pageSize * r.trending / 100);
    const fCount = Math.round(pageSize * r.fresh / 100);
    const pCount = Math.round(pageSize * r.personalized / 100);
    const foCount = Math.round(pageSize * r.followed / 100);

    const [trending, fresh, personalized, followed] = await Promise.all([
      tCount > 0 ? fetchTrending(tCount, offset) : Promise.resolve([]),
      fCount > 0 ? fetchFresh(fCount, offset) : Promise.resolve([]),
      pCount > 0 ? fetchPersonalized(userId, pCount, offset) : Promise.resolve([]),
      foCount > 0 ? fetchFollowed(userId, foCount, offset) : Promise.resolve([]),
    ]);

    const merged = interleave([trending, fresh, personalized, followed]);
    // Deduplicate
    const seen = new Set();
    const deduped = merged.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
    return deduped.slice(0, pageSize);
  } catch {
    return [];
  }
}