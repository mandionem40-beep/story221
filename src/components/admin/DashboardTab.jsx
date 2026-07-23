import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Cell, PieChart, Pie,
} from "recharts";
import {
  Users, DollarSign, Sparkles, Eye, Heart, MessageCircle,
  UserPlus, TrendingUp, Video, Image, FileText, Gift,
  AlertCircle, CheckCircle, Clock, Flag, Vote, CreditCard,
  Clapperboard, Loader2,
} from "lucide-react";

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

function isSameDay(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isThisWeek(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo;
}

function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isThisYear(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear();
}

function KpiCard({ icon: Icon, label, value, sublabel, color = "bg-primary/10" }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="text-[11px] text-muted-foreground leading-tight">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      {sublabel && <p className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</p>}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-primary" />
      <h3 className="text-sm font-semibold text-white">{children}</h3>
    </div>
  );
}

export default function DashboardTab({ data }) {
  const {
    users = [], generations = [], transactions = [], reels = [],
    packs = [], reports = [], feedbacks = [], polls = [],
    referrals = [], referralClicks = [], messages = [], conversations = [],
  } = data;

  // User metrics
  const totalUsers = users.length;
  const newToday = users.filter((u) => isSameDay(u.created_date)).length;
  const newThisWeek = users.filter((u) => isThisWeek(u.created_date)).length;
  const newThisMonth = users.filter((u) => isThisMonth(u.created_date)).length;
  const activeUsers = users.filter((u) => (u.diamonds || 0) > 0 || (u.last_login_date && isThisWeek(u.last_login_date))).length;
  const inactiveUsers = totalUsers - activeUsers;

  // Generation metrics
  const videoGens = generations.filter((g) => g.type === "video" || g.type === "film" || g.type === "serie" || g.type === "ad" || g.type === "anime" || g.type === "cartoon" || g.type === "music_clip");
  const imageGens = generations.filter((g) => g.type === "storyboard" || g.type === "character");
  const publishedGens = generations.filter((g) => g.is_published);
  const pendingGens = generations.filter((g) => g.status === "pending" || g.status === "processing");

  // Revenue metrics
  const purchases = transactions.filter((t) => t.type === "purchase");
  const totalRevenue = purchases.reduce((s, t) => s + (t.amount || 0), 0);
  const revenueToday = purchases.filter((t) => isSameDay(t.created_date)).reduce((s, t) => s + (t.amount || 0), 0);
  const revenueMonth = purchases.filter((t) => isThisMonth(t.created_date)).reduce((s, t) => s + (t.amount || 0), 0);
  const revenueYear = purchases.filter((t) => isThisYear(t.created_date)).reduce((s, t) => s + (t.amount || 0), 0);
  const failedPayments = transactions.filter((t) => t.description?.toLowerCase().includes("échec") || t.description?.toLowerCase().includes("fail")).length;

  // Referral metrics
  const totalReferrals = referrals.length;
  const referralRewards = publishedGens.filter((g) => referrals.some((r) => r.id === g.created_by_id)).length * 5;
  const pendingRewards = (totalReferrals - (referralRewards / 5)) * 5;

  // Support & engagement
  const supportTickets = conversations.filter((c) => c.status === "open").length;
  const feedbackCount = feedbacks.length;
  const activePolls = polls.filter((p) => p.status === "active").length;

  // Charts
  const userGrowth = useMemo(() => cumulative(groupByDate(users)), [users]);
  const revenueData = useMemo(() => cumulative(groupByDate(purchases)), [purchases]);
  const gensByType = useMemo(() => {
    const groups = {};
    generations.forEach((g) => { groups[g.type] = (groups[g.type] || 0) + 1; });
    return Object.entries(groups).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [generations]);

  const genStatusPie = useMemo(() => {
    const groups = { completed: 0, pending: 0, processing: 0, failed: 0 };
    generations.forEach((g) => { groups[g.status] = (groups[g.status] || 0) + 1; });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [generations]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Tableau de bord</h2>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Temps réel
        </span>
      </div>

      {/* Users KPIs */}
      <div>
        <SectionTitle icon={Users}>Utilisateurs</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard icon={Users} label="Total" value={totalUsers} />
          <KpiCard icon={UserPlus} label="Nouveaux (jour)" value={newToday} color="bg-green-500/10" />
          <KpiCard icon={UserPlus} label="Nouveaux (semaine)" value={newThisWeek} color="bg-blue-500/10" />
          <KpiCard icon={UserPlus} label="Nouveaux (mois)" value={newThisMonth} color="bg-indigo-500/10" />
          <KpiCard icon={CheckCircle} label="Actifs" value={activeUsers} color="bg-green-500/10" />
          <KpiCard icon={Clock} label="Inactifs" value={inactiveUsers} color="bg-yellow-500/10" />
        </div>
      </div>

      {/* Content KPIs */}
      <div>
        <SectionTitle icon={Sparkles}>Contenu</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard icon={Video} label="Vidéos générées" value={videoGens.length} color="bg-purple-500/10" />
          <KpiCard icon={Image} label="Images générées" value={imageGens.length} color="bg-pink-500/10" />
          <KpiCard icon={FileText} label="Projets totaux" value={generations.length} color="bg-blue-500/10" />
          <KpiCard icon={CheckCircle} label="Projets publiés" value={publishedGens.length} color="bg-green-500/10" />
          <KpiCard icon={Clock} label="En attente" value={pendingGens.length} color="bg-yellow-500/10" />
        </div>
      </div>

      {/* Revenue KPIs */}
      <div>
        <SectionTitle icon={CreditCard}>Revenus</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard icon={DollarSign} label="CA du jour (💎)" value={revenueToday} color="bg-green-500/10" />
          <KpiCard icon={DollarSign} label="CA mensuel (💎)" value={revenueMonth} color="bg-green-500/10" />
          <KpiCard icon={DollarSign} label="CA annuel (💎)" value={revenueYear} color="bg-green-500/10" />
          <KpiCard icon={TrendingUp} label="Revenus totaux (💎)" value={totalRevenue} color="bg-green-500/10" />
          <KpiCard icon={CheckCircle} label="Paiements réussis" value={purchases.length} color="bg-green-500/10" />
          <KpiCard icon={AlertCircle} label="Paiements échoués" value={failedPayments} color="bg-red-500/10" />
        </div>
      </div>

      {/* Referral & Support KPIs */}
      <div>
        <SectionTitle icon={Gift}>Parrainage & Support</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard icon={Gift} label="Parrainages" value={totalReferrals} color="bg-amber-500/10" />
          <KpiCard icon={CheckCircle} label="Récompenses distribuées" value={referralRewards} color="bg-green-500/10" />
          <KpiCard icon={Clock} label="Récompenses en attente" value={pendingRewards > 0 ? pendingRewards : 0} color="bg-yellow-500/10" />
          <KpiCard icon={MessageCircle} label="Tickets support" value={supportTickets} color="bg-blue-500/10" />
          <KpiCard icon={Vote} label="Sondages actifs" value={activePolls} color="bg-purple-500/10" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Croissance utilisateurs</h3>
          {userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="count" stroke="#ff0033" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Pas encore de données</p>
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenus (diamants achetés)</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Générations par type</h3>
          {gensByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gensByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} angle={-30} textAnchor="end" height={60} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {gensByType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Pas encore de générations</p>
          )}
        </div>

        <div className="rounded-2xl bg-card border border-border p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Statut des générations</h3>
          {genStatusPie.some((s) => s.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={genStatusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false} style={{ fontSize: "11px" }}>
                  {genStatusPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Pas encore de données</p>
          )}
        </div>
      </div>
    </div>
  );
}