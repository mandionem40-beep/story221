import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";
import DiamondIcon from "@/components/DiamondIcon";

export default function AdjustCreditsDialog({ user, open, onClose, onConfirm }) {
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setAmount(0);
      setDescription("");
    }
  }, [open]);

  const currentDiamonds = user?.diamonds || 0;
  const newBalance = currentDiamonds + (parseInt(amount) || 0);

  const handleConfirm = () => {
    const parsed = parseInt(amount);
    if (isNaN(parsed) || parsed === 0) return;
    onConfirm(parsed, description.trim() || `Ajustement manuel par l'admin`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-white">Ajuster les diamants</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* User info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
              {(user?.username || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">@{user?.username || user?.email?.split("@")[0]}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
              Solde actuel: {currentDiamonds}
              <DiamondIcon className="w-3 h-3" />
            </p>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <Label>Nombre de diamants</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setAmount((a) => (parseInt(a) || 0) - 10)} type="button">
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-center text-lg font-bold"
                placeholder="0"
              />
              <Button variant="outline" size="icon" onClick={() => setAmount((a) => (parseInt(a) || 0) + 10)} type="button">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[50, 100, 500, 1000].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className="px-3 py-1 rounded-lg bg-secondary text-xs text-white hover:bg-secondary/70"
                  type="button"
                >
                  +{v}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Positif pour créditer, négatif pour débiter.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (optionnel)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Raison de l'ajustement..."
            />
          </div>

          {/* New balance preview */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Nouveau solde</span>
            <span className="text-lg font-bold text-white flex items-center gap-1">
              {newBalance}
              <DiamondIcon className="w-4 h-4" />
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleConfirm} disabled={!parseInt(amount)}>
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}