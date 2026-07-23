import { useState, useMemo } from "react";
import { Search, Download, TrendingUp, TrendingDown, DollarSign, Wallet, ShoppingBag, Calendar, Plus, Trash2, Receipt, ArrowUpRight, ArrowDownRight, PiggyBank } from "lucide-react";
import DiamondIcon from "@/components/DiamondIcon";
import { toast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const formatFCFA = (n) => (n || 0).toLocaleString("fr-FR").replace(/\u00A0/g, " ") + " FCFA";

const CATEGORY_LABELS = {
  facebook_ads: "Facebook Ads",
  tiktok_ads: "TikTok Ads",
  influencer: "Influenceurs",
  server: "Serveurs",
  api_ia: "API IA",
  hosting: "Hébergement",
  marketing: "Marketing (autre)",
  salaries: "Salaires",
  tools: "Outils",
  payment_fees: "Frais de paiement",
  other: "Autre",
};

const CATEGORY_COLORS = {
  facebook_ads: "bg-blue-500/10 text-blue-400",
  tiktok_ads: "bg-pink-500/10 text-pink-400",
  influencer: "bg-purple-500/10 text-purple-400",
  server: "bg-cyan-500/10 text-cyan-400",
  api_ia: "bg-indigo-500/10 text-indigo-400",
  hosting: "bg-teal-500/10 text-teal-400",
  marketing: "bg-orange-500/10 text-orange-400",
  salaries: "bg-green-500/10 text-green-400",
  tools: "bg-amber-500/10 text-amber-400",
  payment_fees: "bg-yellow-500/10 text-yellow-400",
  other: "bg-gray-500/10 text-gray-400",
};

export default function FinanceTab({ transactions, packs, expenses, onAddExpense, onDeleteExpense }) {
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: "facebook_ads", description: "", amount_fcfa: 0, date: new Date().toISOString().split("T")[0], recurring: false });

  const packPriceMap = useMemo(() => {
    const map = {};
    (packs || []).forEach((p) => { if (p.diamonds) map[p.diamonds] = p.price_fcfa; });
    return map;
  }, [packs]);

  const purchases = useMemo(() => {
    return (transactions || []).filter((t) => t.type === "purchase");
  }, [transactions]);

  const getTransactionPrice = (tx) => {
    if (tx.price_fcfa) return tx.price_fcfa;
    if (tx.amount && packPriceMap[tx.amount]) return packPriceMap[tx.amount];
    return 0;
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.reference || "").toLowerCase().includes(q) ||
        (t.pack_name || "").toLowerCase().includes(q);
      if (!matchesSearch) return false;
      return periodFilter === "all" || isInPeriod(t.created_date, periodFilter);
    });
  }, [purchases, search, periodFilter]);

  const filteredExpenses = useMemo(() => {
    return (expenses || []).filter((e) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        (e.description || "").toLowerCase().includes(q) ||
        (CATEGORY_LABELS[e.category] || "").toLowerCase().includes(q);
      if (!matchesSearch) return false;
      return periodFilter === "all" || isInPeriod(e.date, periodFilter);
    });
  }, [expenses, search, periodFilter]);

  const totalRevenueFCFA = filteredPurchases.reduce((sum, t) => sum + getTransactionPrice(t), 0);
  const totalExpensesFCFA = filteredExpenses.reduce((sum, e) => sum + (e.amount_fcfa || 0), 0);
  const netProfit = totalRevenueFCFA - totalExpensesFCFA;
  const totalDiamondsSold = filteredPurchases.reduce((sum, t) => sum + (t.amount || 0), 0);
  const margin = totalRevenueFCFA > 0 ? Math.round((netProfit / totalRevenueFCFA) * 100) : 0;

  // Monthly breakdown (revenue vs expenses)
  const monthlyData = useMemo(() => {
    const months = {};
    purchases.forEach((t) => {
      const d = new Date(t.created_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) months[key] = { revenue: 0, expenses: 0 };
      months[key].revenue += getTransactionPrice(t);
    });
    (expenses || []).forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!months[key]) months[key] = { revenue: 0, expenses: 0 };
      months[key].expenses += e.amount_fcfa || 0;
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  }, [purchases, expenses]);

  const maxValue = Math.max(...monthlyData.map(([, v]) => Math.max(v.revenue, v.expenses)), 1);

  // Expenses by category
  const expensesByCategory = useMemo(() => {
    const cats = {};
    (expenses || []).forEach((e) => {
      if (!cats[e.category]) cats[e.category] = 0;
      cats[e.category] += e.amount_fcfa || 0;
    });
    return Object.entries(cats).sort(([, a], [, b]) => b - a);
  }, [expenses]);

  const exportCSV = () => {
    const headers = ["Date", "Type", "Catégorie/Pack", "Description", "Montant FCFA", "Référence"];
    const rows = [
      ...filteredPurchases.map((t) => [
        new Date(t.created_date).toLocaleString("fr-FR"),
        "Revenu",
        t.pack_name || "Achat",
        (t.description || "").replace(/"/g, "'"),
        getTransactionPrice(t),
        t.reference || "",
      ]),
      ...filteredExpenses.map((e) => [
        new Date(e.date).toLocaleString("fr-FR"),
        "Dépense",
        CATEGORY_LABELS[e.category] || e.category,
        (e.description || "").replace(/"/g, "'"),
        -(e.amount_fcfa || 0),
        "",
      ]),
    ];
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddExpense = async () => {
    if (!newExpense.amount_fcfa || newExpense.amount_fcfa <= 0) {
      toast({ title: "Erreur", description: "Entrez un montant valide.", variant: "destructive" });
      return;
    }
    try {
      await base44.entities.Expense.create(newExpense);
      onAddExpense();
      setNewExpense({ category: "facebook_ads", description: "", amount_fcfa: 0, date: new Date().toISOString().split("T")[0], recurring: false });
      setShowAddExpense(false);
      toast({ title: "Dépense ajoutée" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'ajouter la dépense.", variant: "destructive" });
    }
  };

  const stats = [
    {
      icon: ArrowUpRight,
      label: "Revenus",
      value: formatFCFA(totalRevenueFCFA),
      color: "bg-green-500/10",
      iconColor: "text-green-400",
    },
    {
      icon: ArrowDownRight,
      label: "Dépenses",
      value: formatFCFA(totalExpensesFCFA),
      color: "bg-red-500/10",
      iconColor: "text-red-400",
    },
    {
      icon: DollarSign,
      label: "Profit net",
      value: formatFCFA(netProfit),
      color: netProfit >= 0 ? "bg-primary/10" : "bg-red-500/10",
      iconColor: netProfit >= 0 ? "text-primary" : "text-red-400",
    },
    {
      icon: TrendingUp,
      label: "Marge",
      value: `${margin}%`,
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
        <div className="flex gap-2">
          <button onClick={() => setShowAddExpense(!showAddExpense)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-white text-sm font-semibold border border-border">
            <Plus className="w-4 h-4" /> Dépense
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Add expense form */}
      {showAddExpense && (
        <div className="rounded-2xl bg-card border border-border p-4 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" /> Nouvelle dépense
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white">
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <input value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} placeholder="Description (ex: Veo 3 API)" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
            <input type="number" value={newExpense.amount_fcfa || ""} onChange={(e) => setNewExpense({ ...newExpense, amount_fcfa: parseInt(e.target.value) || 0 })} placeholder="Montant FCFA" className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
            <input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} className="h-10 rounded-lg bg-background border border-border px-3 text-sm text-white" />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input type="checkbox" checked={newExpense.recurring} onChange={(e) => setNewExpense({ ...newExpense, recurring: e.target.checked })} className="accent-primary" />
              Récurrent (mensuel)
            </label>
            <button onClick={handleAddExpense} className="ml-auto px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold">Ajouter</button>
          </div>
        </div>
      )}

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

      {/* Monthly evolution chart - full width */}
      {monthlyData.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-5 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-white">Évolution mensuelle : Revenus vs Dépenses</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-2.5 h-2.5 rounded bg-green-500" />Revenus</span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-2.5 h-2.5 rounded bg-red-500" />Dépenses</span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="w-3 h-0.5 bg-primary" />Marge nette</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={monthlyData.map(([month, data]) => {
              const [year, mon] = month.split("-");
              const label = new Date(year, parseInt(mon) - 1).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
              return { month: label, revenus: data.revenue, depenses: data.expenses, marge: data.revenue - data.expenses };
            })} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "12px" }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value, name) => [formatFCFA(value), name]}
              />
              <Bar dataKey="revenus" name="Revenus" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar dataKey="depenses" name="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Line dataKey="marge" name="Marge nette" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 3 }} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
          {/* Current net margin summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Revenus (mois)</p>
                <p className="text-sm font-bold text-green-400">{formatFCFA(monthlyData[monthlyData.length - 1]?.[1]?.revenue || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Dépenses (mois)</p>
                <p className="text-sm font-bold text-red-400">{formatFCFA(monthlyData[monthlyData.length - 1]?.[1]?.expenses || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Marge nette (mois)</p>
                <p className={`text-sm font-bold ${((monthlyData[monthlyData.length - 1]?.[1]?.revenue || 0) - (monthlyData[monthlyData.length - 1]?.[1]?.expenses || 0)) >= 0 ? "text-primary" : "text-red-400"}`}>
                  {formatFCFA((monthlyData[monthlyData.length - 1]?.[1]?.revenue || 0) - (monthlyData[monthlyData.length - 1]?.[1]?.expenses || 0))}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Marge globale</p>
                <p className={`text-sm font-bold ${margin >= 0 ? "text-purple-400" : "text-red-400"}`}>{margin}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expenses by category */}
      {expensesByCategory.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-white">Dépenses par catégorie</h3>
          </div>
          <div className="space-y-3">
            {expensesByCategory.map(([cat, amount]) => {
              const pct = totalExpensesFCFA > 0 ? Math.round((amount / totalExpensesFCFA) * 100) : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${CATEGORY_COLORS[cat]}`}>{CATEGORY_LABELS[cat]}</span>
                    <span className="text-xs font-semibold text-white">{formatFCFA(amount)} · {pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transparency breakdown */}
      <div className="rounded-2xl bg-card border border-border p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-white">Tableau de transparence</h3>
          <span className="text-[10px] text-muted-foreground ml-auto">Calcul détaillé du profit</span>
        </div>
        <div className="space-y-2">
          {/* Revenue line */}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="flex items-center gap-2 text-sm text-white">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Revenus (achats de crédits)
            </span>
            <span className="text-sm font-bold text-green-400">+ {formatFCFA(totalRevenueFCFA)}</span>
          </div>
          {/* Each expense category */}
          {expensesByCategory.length > 0 ? (
            expensesByCategory.map(([cat, amount]) => (
              <div key={cat} className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="flex items-center gap-2 text-sm text-white">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {CATEGORY_LABELS[cat] || cat}
                </span>
                <span className="text-sm font-semibold text-red-400">- {formatFCFA(amount)}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">Aucune dépense enregistrée pour cette période.</p>
          )}
          {/* Net profit */}
          <div className={`flex items-center justify-between py-3 mt-2 rounded-lg px-3 ${netProfit >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
            <span className="flex items-center gap-2 text-sm font-bold text-white">
              <DollarSign className="w-4 h-4" />
              Profit net = Revenus - Dépenses
            </span>
            <span className={`text-base font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              {netProfit >= 0 ? "+ " : "- "}{formatFCFA(Math.abs(netProfit))}
            </span>
          </div>
          {/* Margin */}
          <div className="flex items-center justify-between py-2 px-3">
            <span className="text-xs text-muted-foreground">Marge bénéficiaire</span>
            <span className={`text-xs font-bold ${margin >= 0 ? "text-green-400" : "text-red-400"}`}>{margin}%</span>
          </div>
        </div>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm text-white" />
        </div>
        <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} className="h-10 px-3 rounded-lg bg-card border border-border text-sm text-white">
          <option value="all">Toute la période</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">7 derniers jours</option>
          <option value="month">Ce mois-ci</option>
        </select>
      </div>

      {/* Expenses list */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-red-400" /> Dépenses ({filteredExpenses.length})
        </h3>
        <div className="space-y-2">
          {filteredExpenses.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${CATEGORY_COLORS[e.category]}`}>
                <Receipt className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{e.description || CATEGORY_LABELS[e.category]}</p>
                <p className="text-xs text-muted-foreground">
                  <span className={`px-1.5 py-0.5 rounded ${CATEGORY_COLORS[e.category]}`}>{CATEGORY_LABELS[e.category]}</span>
                  {" · "}
                  {new Date(e.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  {e.recurring && " · Récurrent"}
                </p>
              </div>
              <p className="text-sm font-bold text-red-400 flex-shrink-0">-{formatFCFA(e.amount_fcfa)}</p>
              <button onClick={() => onDeleteExpense(e.id)} className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {filteredExpenses.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune dépense enregistrée.</p>
          )}
        </div>
      </div>

      {/* Purchases list */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-green-400" /> Achats de crédits ({filteredPurchases.length})
        </h3>
        <div className="space-y-2">
          {filteredPurchases.map((tx) => {
            const price = getTransactionPrice(tx);
            return (
              <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <DiamondIcon className="w-4 h-4" filled />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{tx.pack_name || tx.description || "Achat de crédits"}</p>
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
          {filteredPurchases.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Aucun achat de crédits pour cette période.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function isInPeriod(dateStr, period) {
  const d = new Date(dateStr);
  const now = new Date();
  if (period === "today") return d.toDateString() === now.toDateString();
  if (period === "week") {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }
  if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  return true;
}