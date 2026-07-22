import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Diamond, TrendingUp, TrendingDown, Sparkles, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function Diamonds() {
  const { currentUser, refreshUser } = useOutletContext();
  const [packs, setPacks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
      toast({ title: "Paiement réussi !", description: "Vos diamants seront crédités sous peu." });
      window.history.replaceState({}, '', '/app/diamonds');
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [packData, txData] = await Promise.all([
        base44.entities.DiamondPack.filter({ active: true }),
        base44.entities.Transaction.list("-created_date", 50),
      ]);
      setPacks((packData || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
      setTransactions(txData || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleBuy = async (pack) => {
    setPurchasing(pack.id);
    try {
      const response = await base44.functions.invoke('paydunya-initiate', {
        packId: pack.id,
        packName: pack.name,
        diamonds: pack.diamonds,
        amount: pack.price_fcfa,
      });
      if (response.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible d'initier le paiement.", variant: "destructive" });
      setPurchasing(null);
    }
  };

  const diamonds = currentUser?.diamonds ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-bold text-white mb-1">Diamants</h1>
      <p className="text-sm text-muted-foreground mb-6">Achetez des diamants pour créer sans limite.</p>

      {/* Balance */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-transparent border border-primary/20 p-5 mb-8 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Diamond className="w-6 h-6 text-primary" fill="currentColor" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Solde actuel</p>
          <p className="text-2xl font-bold text-white">{diamonds} 💎</p>
        </div>
      </div>

      {/* Packs */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Packs disponibles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {packs.map(pack => (
          <div
            key={pack.id}
            className={`relative rounded-2xl p-5 border transition-all ${
              pack.popular ? "bg-card border-primary glow-red-sm" : "bg-card border-border"
            }`}
          >
            {pack.popular && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-[10px] font-semibold whitespace-nowrap">
                Populaire
              </span>
            )}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Diamond className="w-6 h-6 text-primary" fill="currentColor" />
                <span className="text-3xl font-bold text-white">{pack.diamonds}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{pack.name}</p>
              <div className="pb-4 border-b border-border mb-4">
                <span className="text-xl font-bold text-white">{pack.price_fcfa.toLocaleString("fr-FR")}</span>
                <span className="text-sm text-muted-foreground ml-1">FCFA</span>
              </div>
              <button
                onClick={() => handleBuy(pack)}
                disabled={purchasing === pack.id}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  pack.popular ? "bg-primary text-white hover:bg-primary/90" : "bg-secondary text-white hover:bg-secondary/70 border border-border"
                }`}
              >
                {purchasing === pack.id ? <Loader2 className="w-4 h-4 mx-auto animate-spin" /> : "Acheter"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Historique des transactions</h2>
      {transactions.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-card border border-border">
          <p className="text-sm text-muted-foreground">Aucune transaction pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                tx.amount > 0 ? "bg-green-500/20" : "bg-destructive/20"
              }`}>
                {tx.amount > 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{tx.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(tx.created_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${tx.amount > 0 ? "text-green-500" : "text-destructive"}`}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount} 💎
                </p>
                <p className="text-xs text-muted-foreground">Solde: {tx.balance_after ?? "—"} 💎</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}