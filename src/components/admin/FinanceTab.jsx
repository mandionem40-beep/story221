import { useState, useMemo } from "react";
import { Search, Download, TrendingUp, DollarSign, Wallet, ShoppingBag, Calendar } from "lucide-react";
import DiamondIcon from "@/components/DiamondIcon";

const formatFCFA = (n) => (n || 0).toLocaleString("fr-FR").replace(/\u00A0/g, " ") + " FCFA";

export default function FinanceTab({ transactions, packs }) {
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");

  // Build a lookup: diamonds -> price_fcfa from packs
  const packPriceMap = useMemo(() => {
    const map = {};
    (packs || []).forEach((p) => {
      if (p.diamonds) map[p.diamonds] = p.price_fcfa;
    });
    return map;
  }, [packs]);

  // Only credit purchases
  const purchases = useMemo(() => {
    return (transactions || []).filter((t) => t.type === "purchase");
  }, [transactions]);

  const getTransactionPrice = (tx) => {
    if (tx.price_fcfa) return tx.price_fcfa;
    if (tx.amount && packPriceMap[tx.amount]) return packPriceMap[tx.amount];
    return 0;
  };

  const filtered = useMemo(() => {
    return purchases.filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.reference || "").toLowerCase().includes(q) ||
        (t.pack_name || "").toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (periodFilter === "all") return true;

      const txDate = new Date(t.created_date);
      const now = new Date();
      if (periodFilter === "today") {
        return txDate.toDateString() === now.toDateString();
      }
      if (periodFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return txDate >= weekAgo;
      }
      if (periodFilter === "month") {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [purchases, search, periodFilter]);

  const totalRevenueFCFA = filtered.reduce((sum, t) => sum + getTransactionPrice(t), 0);
  const totalDiamondsSold = filtered.reduce((sum, t) => sum + (t.amount || 0), 0);
  const avgBasket = filtered.length > 0 ? Math.round(totalRevenueFCFA / filtered.length) : 0;

  // Monthly breakdown
  const monthlyData = useMemo(() => {
    const months = {};
    purchases.forEach((t) => {
      const d = new Date(t.created_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) months[key] = { revenue: 0, count: 0, diamonds: 0 };
      months[key].revenue += getTransactionPrice(t);
      months[key].count += 1;
      months[key].diamonds += t.amount || 0;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
  }, [purchases]);

  const maxRevenue = Math.max(...monthlyData.map(([, v]) => v.revenue), 1);

  const exportCSV = () => {
    const headers = ["Date", "Pack", "Description", "Diamants", "Prix FCFA", "Référence"];
    const rows = filtered.map((t) => [
      new Date(t.created_date).toLocaleString("fr-FR"),
      t.pack_name || "",
      (t.description || "").replace(/"/g, "'"),
      t.amount || 0,
      getTransactionPrice(t),
      t.reference || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      icon: DollarSign,
      label: "Revenus totaux",
      value: formatFCFA(totalRevenueFCFA),
      color: "bg-green-500/10",
      iconColor: "text-green-400",
    },
    {
      icon: ShoppingBag,
      label: "Achats de crédits",
      value: filtered.length,
      color: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },
    {
      icon: DiamondIcon,
      label: "Diamants vendus",
      value: totalDiamondsSold,
      color: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      icon: TrendingUp,
      label: "Panier moyen",
      value: formatFCFA(avgBasket),
      color: "bg-purple-500/10",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" /> Finance
        </h2>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className={`w-3.5 h-3.5 ${s.iconColor}`} />
              </div>
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-lg font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly revenue chart */}
      {monthlyData.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-white">Revenus mensuels</h3>
          </div>
          <div className="flex items-end gap-3 h-40">
            {monthlyData.map(([month, data]) => {
              const [year, mon] = month.split("-");
              const label = new Date(year, parseInt(mon) - 1).toLocaleDateString("fr-FR", { month: "short" });
              const height = Math.max(4, (data.revenue / maxRevenue) * 100);
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {data.revenue > 0 ? Math.round(data.revenue / 1000) + "k" : "0"}
                  </span>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/60 transition-all" style={{ height: `${height}%` }} />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un achat..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm text-white"
          />
        </div>
        <select
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-card border border-border text-sm text-white"
        >
          <option value="all">Toute la période</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">7 derniers jours</option>
          <option value="month">Ce mois-ci</option>
        </select>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{filtered.length} achat(s) de crédits</p>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((tx) => {
          const price = getTransactionPrice(tx);
          return (
            <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <DiamondIcon className="w-4 h-4" filled />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">
                  {tx.pack_name || tx.description || "Achat de crédits"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(tx.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {tx.reference && ` · ${tx.reference.substring(0, 16)}`}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-green-400">{formatFCFA(price)}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                  <DiamondIcon className="w-3 h-3" filled /> {tx.amount || 0}
                </p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">Aucun achat de crédits pour cette période.</p>
        )}
      </div>
    </div>
  );
}