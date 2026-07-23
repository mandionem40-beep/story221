import { useState, useMemo } from "react";
import { Search, Download, CreditCard, CheckCircle, XCircle, Clock, ArrowUpDown } from "lucide-react";

const TYPE_LABELS = {
  purchase: "Achat",
  generation: "Génération",
  referral: "Parrainage",
  admin_adjustment: "Ajustement",
  free_trial: "Essai gratuit",
};

export default function TransactionsTab({ transactions }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    return (transactions || []).filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.reference || "").toLowerCase().includes(q) ||
        (t.type || "").toLowerCase().includes(q);
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, typeFilter]);

  const purchases = (transactions || []).filter((t) => t.type === "purchase");
  const totalRevenue = purchases.reduce((s, t) => s + (t.amount || 0), 0);

  const exportCSV = () => {
    const headers = ["Date", "Type", "Description", "Montant", "Référence", "Solde après"];
    const rows = filtered.map((t) => [
      new Date(t.created_date).toLocaleString("fr-FR"),
      t.type || "",
      (t.description || "").replace(/"/g, "'"),
      t.amount || 0,
      t.reference || "",
      t.balance_after || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { icon: CreditCard, label: "Total", value: transactions.length, color: "bg-blue-500/10" },
    { icon: CheckCircle, label: "Achats", value: purchases.length, color: "bg-green-500/10" },
    { icon: ArrowUpDown, label: "Revenus (💎)", value: totalRevenue, color: "bg-primary/10" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Paiements & Transactions</h2>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-sm font-semibold">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-lg font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm text-white"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-card border border-border text-sm text-white"
        >
          <option value="all">Tous les types</option>
          <option value="purchase">Achats</option>
          <option value="generation">Générations</option>
          <option value="referral">Parrainages</option>
          <option value="admin_adjustment">Ajustements</option>
          <option value="free_trial">Essais gratuits</option>
        </select>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{filtered.length} transaction(s)</p>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((tx) => (
          <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.amount > 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
              {tx.type === "purchase" ? <CheckCircle className="w-4 h-4 text-green-400" /> : <CreditCard className="w-4 h-4 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{tx.description || TYPE_LABELS[tx.type] || tx.type}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(tx.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                {" · "}
                <span className="text-primary">{TYPE_LABELS[tx.type] || tx.type}</span>
                {tx.reference && ` · ${tx.reference.substring(0, 16)}`}
              </p>
            </div>
            <p className={`text-sm font-semibold flex-shrink-0 ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>
              {tx.amount > 0 ? "+" : ""}{tx.amount} 💎
            </p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">Aucune transaction trouvée.</p>
        )}
      </div>
    </div>
  );
}