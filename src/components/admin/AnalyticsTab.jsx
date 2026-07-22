import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Cell,
} from "recharts";
import { Users, DollarSign, Sparkles, Eye, Heart, MessageCircle, UserPlus, TrendingUp, Trophy, Globe } from "lucide-react";

const CHART_COLORS = ["#ff0033", "#ff4466", "#ff6688", "#ff8899", "#ffaa77", "#ffcc55", "#aa00ff", "#00aaff"];

function groupByDate(items, dateField = "created_date") {
  const groups = {};
  (items || []).forEach((item) => {
    if (!item[dateField]) return;
    const date = new Date(item[dateField]).toISOString().split("T")[0];
    groups[date] = (groups[date] || 0) + 1;
  });
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, count]) => ({ date: date.substring(5), count }));
}

function cumulative(items) {
  let total = 0;
  return items.map((item) => {
    total += item.count;
    return { date: item.date, count: total };
  });
}

function groupByField(items, field) {
  const groups = {};
  (items || []).forEach((item) => {
    const key = item[field] || "Inconnu";
    groups[key] = (groups[key] || 0) + 1;
  });
  return Object.entries(groups)
    .map(([key, count]) => ({ name: key, count }))
    .sort((a, b) => b.count - a.count);
}

function topCreators(users, gens) {
  const genCounts = {};
  (gens || []).forEach((g) => {
    genCounts[g.created_by_id] = (genCounts[g.created_by_id] || 0) + 1;
  });
  return (users || [])
    .map((u) => ({
      username: u.username || u.email?.split("@")[0] || "User",
      creations: genCounts[u.id] || 0,
      diamonds: u.diamonds || 0,
      country: u.phone_country || u.country || "—",
    }))
    .filter((u) => u.creations > 0)
    .sort((a, b) => b.creations - a.creations)
    .slice(0, 5);
}

function topReels(reels, likes) {
  const likeCounts = {};
  (likes || []).forEach((l) => {
    likeCounts[l.reel_id] = (likeCounts[l.reel_id] || 0) + 1;
  });
  return [...(reels || [])]
    .map((r) => ({ ...r, likeCount: likeCounts[r.id] || 0 }))
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color || "bg-primary/10"}`}>
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function AnalyticsTab({ data }) {
  const { users = [], generations = [], transactions = [], reels = [], likes = [], comments = [], follows = [] } = data;

  const userGrowth = useMemo(() => cumulative(groupByDate(users)), [users]);
  const revenueData = useMemo(() => {
    const purchases = (transactions || []).filter((t) => t.type === "purchase");
    return cumulative(groupByDate(purchases));
  }, [transactions]);
  const gensByType = useMemo(() => groupByField(generations, "type"), [generations]);
  const countryDist = useMemo(() => groupByField(users, "phone_country"), [users]);
  const creators = useMemo(() => topCreators(users, generations), [users, generations]);
  const topVids = useMemo(() => topReels(reels, likes), [reels, likes]);

  const totalRevenue = (transactions || []).filter((t) => t.type === "purchase").reduce((s, t) => s + (t.amount || 0), 0);
  const totalViews = (reels || []).reduce((s, r) => s + (r.views || 0), 0);
  const freeTrialsUsed = (users || []).filter((u) => u.free_trial_used).length;
  const payingUsers = (users || []).filter((u) => (u.diamonds || 0) > 0 || (transactions || []).some((t) => t.created_by_id === u.id && t.type === "purchase")).length;
  const conversionRate = users.length > 0 ? Math.round((payingUsers / users.length) * 100) : 0;
  const avgViewsPerReel = reels.length > 0 ? Math.round(totalViews / reels.length) : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Analytics & Métriques</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Users} label="Utilisateurs" value={users.length} />
        <StatCard icon={DollarSign} label="Revenus (💎)" value={totalRevenue} color="bg-green-500/10" />
        <StatCard icon={Sparkles} label="Générations" value={generations.length} color="bg-blue-500/10" />
        <StatCard icon={Eye} label="Vues totales" value={totalViews} color="bg-purple-500/10" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Heart} label="Likes" value={likes.length} color="bg-pink-500/10" />
        <StatCard icon={MessageCircle} label="Commentaires" value={comments.length} color="bg-cyan-500/10" />
        <StatCard icon={UserPlus} label="Follows" value={follows.length} color="bg-indigo-500/10" />
        <StatCard icon={TrendingUp} label="Conversion" value={`${conversionRate}%`} color="bg-amber-500/10" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Growth */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Croissance des utilisateurs</h3>
          {userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="count" stroke="#ff0033" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Pas assez de données</p>
          )}
        </div>

        {/* Revenue */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenus (diamants achetés)</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Pas encore de revenus</p>
          )}
        </div>
      </div>

      {/* Bar charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Generations by type */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Générations par type</h3>
          {gensByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gensByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} angle={-30} textAnchor="end" height={60} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {gensByType.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Pas encore de générations</p>
          )}
        </div>

        {/* Country distribution */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> Répartition par pays
          </h3>
          {countryDist.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={countryDist} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={90} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#ff0033" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Pas de données</p>
          )}
        </div>
      </div>

      {/* Top creators & reels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top creators */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" /> Top créateurs
          </h3>
          {creators.length > 0 ? (
            <div className="space-y-2">
              {creators.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-background">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-500/20 text-yellow-500" : i === 1 ? "bg-gray-400/20 text-gray-400" : i === 2 ? "bg-orange-700/20 text-orange-600" : "bg-secondary text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">@{c.username}</p>
                    <p className="text-xs text-muted-foreground">{c.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{c.creations}</p>
                    <p className="text-xs text-muted-foreground">créations</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Pas encore de créateurs</p>
          )}
        </div>

        {/* Top reels */}
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" /> Reels les plus vus
          </h3>
          {topVids.length > 0 ? (
            <div className="space-y-2">
              {topVids.map((r, i) => (
                <div key={r.id || i} className="flex items-center gap-3 p-2 rounded-lg bg-background">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-secondary text-muted-foreground">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground">@{r.author_name || "createur"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{r.views || 0}</p>
                    <p className="text-xs text-muted-foreground">vues</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Pas encore de Reels</p>
          )}
        </div>
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-bold text-white">{freeTrialsUsed}</p>
          <p className="text-xs text-muted-foreground">Essais gratuits utilisés</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-bold text-white">{payingUsers}</p>
          <p className="text-xs text-muted-foreground">Utilisateurs payants</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-bold text-white">{avgViewsPerReel}</p>
          <p className="text-xs text-muted-foreground">Vues moy. / Reel</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-4 text-center">
          <p className="text-2xl font-bold text-white">{reels.length > 0 ? Math.round((likes.length / reels.length) * 10) / 10 : 0}</p>
          <p className="text-xs text-muted-foreground">Likes moy. / Reel</p>
        </div>
      </div>
    </div>
  );
}