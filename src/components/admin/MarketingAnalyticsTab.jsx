import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Users, TrendingUp, DollarSign, Video, Download, Search, Trophy } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import InfluencerManager from "@/components/admin/marketing/InfluencerManager";
import CampaignManager from "@/components/admin/marketing/CampaignManager";
import { toast } from "@/components/ui/use-toast";

const CHANNEL_LABELS = {
  tiktok: "TikTok", facebook: "Facebook", instagram: "Instagram", youtube: "YouTube",
  snapchat: "Snapchat", x: "X (Twitter)", linkedin: "LinkedIn", whatsapp: "WhatsApp",
  google: "Google", friend_recommendation: "Recommandation", sponsored_ad: "Publicité",
  influencer: "Influenceur", other: "Autre",
};

const CHANNEL_COLORS = [
  "#ff0033", "#ff4466", "#ff6b9d", "#ff8c42", "#ffc145", "#4ade80",
  "#22d3ee", "#60a5fa", "#a78bfa", "#c084fc", "#f472b6", "#94a3b8", "#cbd5e1",
];

const AD_PLATFORM_LABELS = {
  tiktok_ads: "TikTok Ads", facebook_ads: "Facebook Ads", instagram_ads: "Instagram Ads",
  youtube_ads: "YouTube Ads", google_ads: "Google Ads", snapchat_ads: "Snapchat Ads",
  linkedin_ads: "LinkedIn Ads", other: "Autre",
};

export default function MarketingAnalyticsTab() {
  const [subTab, setSubTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [attributions, setAttributions] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [generations, setGenerations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChannel, setFilterChannel] = useState("all");
  const [filterInfluencer, setFilterInfluencer] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [attrs, infls, cmps, usrs, txs, gens] = await Promise.all([
        base44.entities.UserAttribution.list("-created_date", 500),
        base44.entities.MarketingInfluencer.list("display_order", 200),
        base44.entities.MarketingCampaign.list("-created_date", 200),
        base44.entities.User.list("-created_date", 500),
        base44.entities.Transaction.list("-created_date", 500),
        base44.entities.Generation.list("-created_date", 500),
      ]);
      setAttributions(attrs || []);
      setInfluencers(infls || []);
      setCampaigns(cmps || []);
      setUsers(usrs || []);
      setTransactions(txs || []);
      setGenerations(gens || []);
    } catch {
      toast({ title: "Erreur de chargement", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Computed stats
  const stats = useMemo(() => {
    const total = attributions.length;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

    const newToday = attributions.filter(a => new Date(a.created_date) >= today).length;
    const newWeek = attributions.filter(a => new Date(a.created_date) >= weekAgo).length;
    const newMonth = attributions.filter(a => new Date(a.created_date) >= monthAgo).length;

    // Channel distribution
    const channelCounts = {};
    attributions.forEach(a => {
      channelCounts[a.discovery_channel] = (channelCounts[a.discovery_channel] || 0) + 1;
    });
    const channelData = Object.entries(channelCounts).map(([ch, count]) => ({
      name: CHANNEL_LABELS[ch] || ch,
      value: count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    })).sort((a, b) => b.value - a.value);

    // Daily evolution (last 30 days)
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date(today); day.setDate(day.getDate() - i);
      const dayEnd = new Date(day); dayEnd.setDate(dayEnd.getDate() + 1);
      const count = attributions.filter(a => {
        const d = new Date(a.created_date);
        return d >= day && d < dayEnd;
      }).length;
      dailyData.push({
        date: day.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        inscriptions: count,
      });
    }

    // Influencer ranking
    const inflCounts = {};
    attributions.filter(a => a.discovery_channel === "influencer" && a.influencer_id).forEach(a => {
      inflCounts[a.influencer_id] = (inflCounts[a.influencer_id] || 0) + 1;
    });
    const influencerRanking = Object.entries(inflCounts).map(([infId, count]) => {
      const inf = influencers.find(i => i.id === infId);
      const userIds = new Set(attributions.filter(a => a.influencer_id === infId).map(a => a.user_id));
      const infTxs = transactions.filter(t => userIds.has(t.created_by_id));
      const revenue = infTxs.reduce((sum, t) => sum + (t.amount_fcfa || 0), 0);
      const infGens = generations.filter(g => userIds.has(g.created_by_id)).length;
      return {
        id: infId,
        name: inf?.name || "Inconnu",
        photo_url: inf?.photo_url,
        social: inf?.primary_social,
        signups: count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
        revenue,
        videos: infGens,
        credits: infTxs.reduce((s, t) => s + (t.diamonds || 0), 0),
      };
    }).sort((a, b) => b.signups - a.signups);

    // Revenue
    const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount_fcfa || 0), 0);
    const activeUsers = users.filter(u => u.account_status !== "banned" && u.account_status !== "suspended").length;
    const conversionRate = users.length > 0 ? Math.round((users.filter(u => u.has_purchased).length / users.length) * 100) : 0;

    // Avg videos per user
    const avgVideos = users.length > 0 ? (generations.length / users.length).toFixed(1) : "0";

    return {
      total, newToday, newWeek, newMonth, channelData, dailyData,
      influencerRanking, totalRevenue, activeUsers, conversionRate, avgVideos,
    };
  }, [attributions, influencers, transactions, generations, users]);

  const filteredAttributions = useMemo(() => {
    return attributions.filter(a => {
      if (filterChannel !== "all" && a.discovery_channel !== filterChannel) return false;
      if (filterInfluencer !== "all" && a.influencer_id !== filterInfluencer) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (a.user_email || "").toLowerCase().includes(q) ||
               (a.user_username || "").toLowerCase().includes(q) ||
               (a.country || "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [attributions, filterChannel, filterInfluencer, searchQuery]);

  const exportCSV = () => {
    const rows = [["Date", "Utilisateur", "Email", "Canal", "Influenceur", "Plateforme pub", "Campagne", "Pays"]];
    const inflMap = Object.fromEntries(influencers.map(i => [i.id, i.name]));
    const cmpMap = Object.fromEntries(campaigns.map(c => [c.id, c.name]));
    filteredAttributions.forEach(a => {
      rows.push([
        new Date(a.created_date).toLocaleDateString("fr-FR"),
        a.user_username || "",
        a.user_email || "",
        CHANNEL_LABELS[a.discovery_channel] || a.discovery_channel,
        inflMap[a.influencer_id] || "",
        AD_PLATFORM_LABELS[a.ad_platform] || "",
        cmpMap[a.campaign_id] || "",
        a.country || "",
      ].map(v => `"${v}"`).join(","));
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attribution_story221_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export CSV téléchargé" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  const subTabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "influencers", label: "Influenceurs" },
    { id: "campaigns", label: "Campagnes" },
    { id: "data", label: "Données" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-2">📈 Marketing Analytics</h2>
      <p className="text-sm text-muted-foreground mb-4">Suivez l'origine de chaque utilisateur et mesurez les performances de vos canaux d'acquisition.</p>

      {/* Sub-tabs */}
      <div className="flex gap-1 p-0.5 rounded-xl bg-secondary border border-border mb-6 w-fit">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${subTab === t.id ? "bg-primary text-white" : "text-muted-foreground hover:text-white"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {subTab === "dashboard" && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Users} label="Total inscriptions" value={stats.total} color="text-primary" />
            <StatCard icon={TrendingUp} label="Nouveaux aujourd'hui" value={stats.newToday} color="text-green-400" />
            <StatCard icon={Users} label="Cette semaine" value={stats.newWeek} color="text-blue-400" />
            <StatCard icon={Users} label="Ce mois" value={stats.newMonth} color="text-purple-400" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={DollarSign} label="Revenus totaux" value={`${stats.totalRevenue.toLocaleString("fr-FR")} FCFA`} color="text-green-400" />
            <StatCard icon={TrendingUp} label="Taux de conversion" value={`${stats.conversionRate}%`} color="text-primary" />
            <StatCard icon={Video} label="Vidéos générées" value={generations.length} color="text-blue-400" />
            <StatCard icon={Video} label="Moy. vidéos/utilisateur" value={stats.avgVideos} color="text-purple-400" />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Channel distribution */}
            <div className="rounded-2xl bg-card border border-border p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Répartition par canal</h3>
              {stats.channelData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={stats.channelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                        {stats.channelData.map((_, i) => <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(0 0% 6%)", border: "1px solid hsl(0 0% 12%)", borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {stats.channelData.map((ch, i) => (
                      <div key={ch.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }} />
                          <span className="text-white">{ch.name}</span>
                        </div>
                        <span className="text-muted-foreground">{ch.value} ({ch.pct}%)</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Daily evolution */}
            <div className="rounded-2xl bg-card border border-border p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Évolution des inscriptions (30 jours)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(0 0% 63.9%)", fontSize: 10 }} interval={3} />
                  <YAxis tick={{ fill: "hsl(0 0% 63.9%)", fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsl(0 0% 6%)", border: "1px solid hsl(0 0% 12%)", borderRadius: 8 }} />
                  <Bar dataKey="inscriptions" fill="hsl(352 100% 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 10 influencers */}
          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <h3 className="text-sm font-semibold text-white">Top 10 Influenceurs</h3>
            </div>
            {stats.influencerRanking.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune attribution via influenceur pour le moment.</p>
            ) : (
              <div className="space-y-2">
                {stats.influencerRanking.slice(0, 10).map((inf, i) => (
                  <div key={inf.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-border">
                    <span className={`text-sm font-bold w-6 text-center ${i < 3 ? "text-yellow-500" : "text-muted-foreground"}`}>{i + 1}</span>
                    {inf.photo_url ? (
                      <img src={inf.photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{inf.name.charAt(0)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-white truncate block">{inf.name}</span>
                      <span className="text-[10px] text-muted-foreground">{inf.signups} inscriptions · {inf.videos} vidéos · {inf.credits} 💎</span>
                    </div>
                    <span className="text-sm font-semibold text-green-400">{inf.revenue.toLocaleString("fr-FR")} FCFA</span>
                    <span className="text-xs text-muted-foreground w-10 text-right">{inf.pct}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Influencers management */}
      {subTab === "influencers" && (
        <InfluencerManager
          influencers={influencers}
          onRefresh={loadData}
          attributions={attributions}
          users={users}
          transactions={transactions}
          generations={generations}
        />
      )}

      {/* Campaigns management */}
      {subTab === "campaigns" && (
        <CampaignManager campaigns={campaigns} onRefresh={loadData} attributions={attributions} />
      )}

      {/* Raw data table */}
      {subTab === "data" && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-bold text-white">Données d'attribution ({filteredAttributions.length})</h2>
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold">
              <Download className="w-4 h-4" />Exporter CSV
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher par utilisateur, email, pays..."
                className="w-full h-10 rounded-lg bg-card border border-border pl-10 pr-3 text-sm text-white"
              />
            </div>
            <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)} className="h-10 rounded-lg bg-card border border-border px-3 text-sm text-white">
              <option value="all">Tous les canaux</option>
              {Object.entries(CHANNEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filterInfluencer} onChange={e => setFilterInfluencer(e.target.value)} className="h-10 rounded-lg bg-card border border-border px-3 text-sm text-white">
              <option value="all">Tous les influenceurs</option>
              {influencers.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl bg-card border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Utilisateur</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Canal</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Influenceur</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Pub</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Pays</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttributions.slice(0, 100).map(a => {
                  const inf = influencers.find(i => i.id === a.influencer_id);
                  return (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="p-3 text-xs text-muted-foreground">{new Date(a.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td className="p-3">
                        <p className="text-sm text-white">{a.user_username || "—"}</p>
                        <p className="text-[10px] text-muted-foreground">{a.user_email || ""}</p>
                      </td>
                      <td className="p-3 text-sm text-white">{CHANNEL_LABELS[a.discovery_channel] || a.discovery_channel}</td>
                      <td className="p-3 text-sm text-white">{inf?.name || "—"}</td>
                      <td className="p-3 text-sm text-white">{AD_PLATFORM_LABELS[a.ad_platform] || "—"}</td>
                      <td className="p-3 text-sm text-white">{a.country || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredAttributions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée trouvée.</p>
            )}
            {filteredAttributions.length > 100 && (
              <p className="text-xs text-muted-foreground text-center py-3 border-t border-border">Affichage des 100 premiers résultats sur {filteredAttributions.length}. Exportez en CSV pour tout voir.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}