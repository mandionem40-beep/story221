import { useState, useMemo } from "react";
import { Search, Diamond, Ban, Pause, Play, Trash2, ChevronDown, ChevronUp, Shield, UserCog } from "lucide-react";

const STATUS_COLORS = {
  active: "bg-green-500/20 text-green-400",
  suspended: "bg-yellow-500/20 text-yellow-400",
  banned: "bg-red-500/20 text-red-400",
};

const STATUS_LABELS = {
  active: "Actif",
  suspended: "Suspendu",
  banned: "Banni",
  undefined: "Actif",
};

export default function UsersTab({ users, onAdjust, onStatus, onDelete, onRoleChange }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    return (users || []).filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.username || "").toLowerCase().includes(q) ||
        (u.full_name || "").toLowerCase().includes(q);
      const userStatus = u.account_status || "active";
      const matchesStatus = statusFilter === "all" || userStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Gestion des utilisateurs</h2>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par email, nom d'utilisateur..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-card border border-border text-sm text-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="suspended">Suspendus</option>
          <option value="banned">Bannis</option>
        </select>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{filtered.length} utilisateur(s) trouvé(s)</p>

      {/* User list */}
      <div className="space-y-2">
        {filtered.map((u) => {
          const status = u.account_status || "active";
          const isExpanded = expandedId === u.id;
          return (
            <div key={u.id} className="rounded-xl bg-card border border-border overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">
                  {(u.username || u.email || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">@{u.username || u.email?.split("@")[0]}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-white flex items-center gap-1 justify-end">
                    <Diamond className="w-3 h-3 text-primary" fill="currentColor" />
                    {u.diamonds || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">{u.role || "user"}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[status] || STATUS_COLORS.active}`}>
                  {STATUS_LABELS[status] || "Actif"}
                </span>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : u.id)}
                  className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-white"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-border p-4 space-y-4 bg-background/50">
                  {/* User details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Inscrit le</p>
                      <p className="text-white">{new Date(u.created_date).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Téléphone</p>
                      <p className="text-white">{u.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pays</p>
                      <p className="text-white">{u.phone_country || u.country || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Code parrainage</p>
                      <p className="text-white">{u.referral_code || "—"}</p>
                    </div>
                  </div>

                  {/* Role selector */}
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Rôle:</span>
                    <select
                      value={u.role || "user"}
                      onChange={(e) => onRoleChange(u, e.target.value)}
                      className="h-8 px-2 rounded-lg bg-secondary border border-border text-xs text-white"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onAdjust(u)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Diamond className="w-3.5 h-3.5" /> Ajuster crédits
                    </button>
                    {status !== "suspended" ? (
                      <button
                        onClick={() => onStatus(u, "suspended")}
                        className="px-3 py-1.5 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Pause className="w-3.5 h-3.5" /> Suspendre
                      </button>
                    ) : (
                      <button
                        onClick={() => onStatus(u, "active")}
                        className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" /> Réactiver
                      </button>
                    )}
                    {status !== "banned" ? (
                      <button
                        onClick={() => onStatus(u, "banned")}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" /> Bannir
                      </button>
                    ) : (
                      <button
                        onClick={() => onStatus(u, "active")}
                        className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" /> Débannir
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(u)}
                      className="px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">Aucun utilisateur trouvé.</p>
        )}
      </div>
    </div>
  );
}