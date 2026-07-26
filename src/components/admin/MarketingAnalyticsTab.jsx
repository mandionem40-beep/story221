import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Users, Megaphone, TrendingUp, Trophy, DollarSign, Video, Download } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import InfluencerManager from "@/components/admin/marketing/InfluencerManager";
import { toast } from "@/components/ui/use-toast";

const NETWORK_LABELS = {
  facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", snapchat: "Snapchat", youtube: "YouTube",
};

const NETWORK_COLORS = {
  facebook: "#1877F2", instagram: "#E4405F", tiktok: "#69C9D0", snapchat: "#FFFC00", youtube: "#FF0000",
};

const COLOR_PALETTE = ["#ff0033", "#ff4466", "#4ade80", "#22d3ee", "#60a5fa", "#a78bfa"];

export default function MarketingAnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [attributions, setAttributions] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [generations, setGenerations] = useState([]);

  const loadData = async () => {
    try {
      const results = await Promise.allSettled([
        base44.entities.UserAttribution.list("-created_date", 500),
        base44.entities.MarketingInfluencer.list("display_order", 200),
        base44.entities.User.list("-created_date", 500),
        base44.entities.Transaction.list("-created_date", 500),
        base44.entities.Generation.list("-created_date", 500),
      ]);
      if (results[0].status === "fulfilled") setAttributions(results[0].value || []);
      if (results[1].status === "fulfilled") setInfluencers(results[1].value || []);
      if (results[2].status === "fulfilled") setUsers(results[2].value || []);
      if (results[3].status === "fulfilled") setTransactions(results[3].value || []);
      if (results[4].status === "fulfilled") setGenerations(results[4].value || []);
    } catch {
      toast({ title: "Erreur de chargement", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Real-time: auto-refresh when new attribution or influencer is created/updated
    const unsubAttrs = base44.entities.UserAttribution.subscribe(() => { loadData(); });
    const unsubInfls = base44.entities.MarketingInfluencer.subscribe(() => { loadData(); });
    return () => { unsubAttrs(); unsubInfls(); };
  }, []);

  const stats = useMemo(() => {
    const total = attributions.length;

    // Source distribution (by network + friend_recommendation)
    const sourceData = [
      ...["facebook", "instagram", "tiktok", "snapchat", "youtube"].map(net => {
        const count = attributions.filter(a => a.network === net).length;
        return { name: NETWORK_LABELS[net], value: count, pct: total > 0 ? Math.round((count / total) * 100) : 0, color: NETWORK_COLORS[net] };
      }),
      {
        name: "Recommandation d'un ami",
        value: attributions.filter(a => a.source === "friend_recommendation").length,
        pct: 0,
        color: "#a78bfa",
      },
    ];
    sourceData.forEach(s => { if (total > 0) s.pct = Math.round((s.value / total) * 100); });

    // Ads stats
    const adAttributions = attributions.filter(a => a.source === "ad");
    const adByNetwork = ["facebook", "instagram", "tiktok", "snapchat", "youtube"].map(net => ({
      name: NETWORK_LABELS[net],
      value: adAttributions.filter(a => a.network === net).length,
      color: NETWORK_COLORS[net],
    })).filter(d => d.value > 0);

    // Influencer ranking
    const inflStats = influencers.map(inf => {
      const infAttrs = attributions.filter(a => a.influencer_id === inf.id);
      const userIds = new Set(infAttrs.map(a => a.user_id));
      const infUsers = users.filter(u => userIds.has(u.id));
      // Active = has generated at least 1 video
      const activeUsers = infUsers.filter(u => generations.some(g => g.created_by_id === u.id)).length;
      const infTxs = transactions.filter(t => userIds.has(t.created_by_id));
      const creditPurchases = infTxs.length;
      const revenue = infTxs.reduce((sum, t) => sum + (t.amount_fcfa || 0), 0);
      const videos = generations.filter(g => userIds.has(g.created_by_id)).length;
      const conversionRate = infAttrs.length > 0 ? Math.round((activeUsers / infAttrs.length) * 100) : 0;
      return {
        id: inf.id, name: inf.name, photo_url: inf.photo_url, social: inf.primary_social,
        signups: infAttrs.length, activeUsers, videos, creditPurchases, revenue, conversionRate,
      };
    }).filter(s => s.signups > 0).sort((a, b) => b.signups - a.signups);

    return { total, sourceData, adCount: adAttributions.length, adByNetwork, inflStats, influencerCount: attributions.filter(a => a.source === "influencer").length, friendCount: attributions.filter(a => a.source === "friend_recommendation").length };
  }, [attributions, influencers, users, transactions, generations]);

  const exportCSV = () => {
    const rows = [["Date", "Utilisateur", "Email", "Source", "Réseau", "Influenceur", "Pays"]];
    const inflMap = Object.fromEntries(influencers.map(i => [i.id, i.name]));
    attributions.forEach(a => {
      rows.push([
        new Date(a.created_date).toLocaleDateString("fr-FR"),
        a.user_username || "",
        a.user_email || "",
        a.source === "ad" ? "Publicité" : a.source === "influencer" ? "Influenceur" : "Recommandation",
        NETWORK_LABELS[a.network] || "",
        inflMap[a.influencer_id] || a.influencer_name || "",
        a.country || "",
      ].map(v => `"${v}"`).join(","));
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `acquisition_story221_${new Date().toISOString().split("T")[0]}.csv`;
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

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h2 className="text-xl font-bold text-white">📊 Acquisition des utilisateurs</h2>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-medium text-muted-foreground hover:text-white">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Mise à jour automatique en temps réel après chaque inscription.</p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <SummaryCard icon={Users} label="Total utilisateurs" value={stats.total} color="text-primary" />
        <SummaryCard icon={Megaphone} label="Via publicités" value={stats.adCount} color="text-blue-400" />
        <SummaryCard icon={TrendingUp} label="Via influenceurs" value={stats.influencerCount} color="text-green-400" />
        <SummaryCard icon={Users} label="Via amis" value={stats.friendCount} color="text-purple-400" />
      </div>

      {/* Répartition par source */}
      <Section title="Répartition par source">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.sourceData.map(s => (
            <div key={s.name} className="rounded-xl bg-card border border-border p-4 text-center">
              <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ background: s.color }} />
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.pct}%</p>
              <p className="text-xs font-medium text-white mt-1 truncate">{s.name}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Publicités */}
      <Section title="📢 Publicités Story221">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl bg-card border border-border p-4 flex flex-col items-center justify-center">
            <Megaphone className="w-8 h-8 text-primary mb-2" />
            <p className="text-3xl font-bold text-white">{stats.adCount}</p>
            <p className="text-sm text-muted-foreground">utilisateurs via publicités</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Répartition par réseau</h4>
            {stats.adByNetwork.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={stats.adByNetwork} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                      {stats.adByNetwork.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(0 0% 6%)", border: "1px solid hsl(0 0% 12%)", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {stats.adByNetwork.map(d => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className="text-white">{d.name}</span>
                      </div>
                      <span className="text-muted-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Section>

      {/* Influenceurs ranking */}
      <Section title="🏆 Influenceurs">
        {stats.inflStats.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune inscription via influenceur pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {stats.inflStats.map((inf, i) => (
              <div key={inf.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <span className={`text-sm font-bold w-6 text-center ${i < 3 ? "text-yellow-500" : "text-muted-foreground"}`}>{i + 1}</span>
                {inf.photo_url ? (
                  <img src={inf.photo_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">{inf.name.charAt(0)}</div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-white truncate block">{inf.name}</span>
                  <span className="text-[10px] text-muted-foreground">{NETWORK_LABELS[inf.social] || inf.social}</span>
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground text-center">
                  <div><p className="text-sm font-bold text-white">{inf.signups}</p><p>inscriptions</p></div>
                  <div><p className="text-sm font-bold text-green-400">{inf.activeUsers}</p><p>actifs</p></div>
                  <div><p className="text-sm font-bold text-blue-400">{inf.videos}</p><p>vidéos</p></div>
                  <div><p className="text-sm font-bold text-purple-400">{inf.creditPurchases}</p><p>achats</p></div>
                  <div><p className="text-sm font-bold text-green-400">{inf.revenue.toLocaleString("fr-FR")}</p><p>FCFA</p></div>
                  <div><p className="text-sm font-bold text-primary">{inf.conversionRate}%</p><p>convers.</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Gestion des influenceurs */}
      <Section title="Gestion des influenceurs">
        <InfluencerManager influencers={influencers} onRefresh={loadData} />
      </Section>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}