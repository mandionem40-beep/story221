import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AI_PROVIDERS, AI_CONFIG_SETTINGS, loadSettings, saveSetting } from "@/lib/admin-settings";
import { Cpu, KeyRound, Activity, AlertTriangle, CheckCircle, Loader2, Save, Power, Zap, Settings2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function AIManagementTab() {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [editingValues, setEditingValues] = useState({});

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const settings = await loadSettings("ai_config");
    setConfigs(settings);
    setEditingValues({});
    setLoading(false);
  };

  const getStatus = (providerId) => {
    const key = `ai_status_${providerId}`;
    const item = configs[key];
    return item ? item.value : "active";
  };

  const toggleProvider = async (providerId) => {
    const current = getStatus(providerId);
    const newStatus = current === "active" ? "disabled" : "active";
    setSaving(providerId);
    try {
      await saveSetting(`ai_status_${providerId}`, newStatus, "ai_config");
      setConfigs((prev) => ({ ...prev, [`ai_status_${providerId}`]: { ...prev[`ai_status_${providerId}`], value: newStatus } }));
      toast({ title: `IA ${newStatus === "active" ? "activée" : "désactivée"}` });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
    setSaving(null);
  };

  const getValue = (key) => {
    if (editingValues[key] !== undefined) return editingValues[key];
    return configs[key]?.value || AI_CONFIG_SETTINGS.find((s) => s.key === key)?.default || "";
  };

  const handleSaveConfig = async (key) => {
    setSaving(key);
    try {
      const setting = AI_CONFIG_SETTINGS.find((s) => s.key === key);
      await saveSetting(key, editingValues[key], "ai_config");
      setConfigs((prev) => ({ ...prev, [key]: { ...prev[key], value: editingValues[key] } }));
      setEditingValues((prev) => { const n = { ...prev }; delete n[key]; return n; });
      toast({ title: "Paramètre enregistré", description: `${setting?.label} mis à jour.` });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
    setSaving(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Gestion des IA</h2>
        <p className="text-sm text-muted-foreground mt-1">Pilotez les API d'intelligence artificielle connectées à Story221.</p>
      </div>

      {/* AI Providers */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-white">Fournisseurs IA connectés</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_PROVIDERS.map((provider) => {
            const status = getStatus(provider.id);
            const isActive = status === "active";
            const hasSecret = provider.secretKey ? true : true; // built-in integrations don't need explicit secrets
            return (
              <div key={provider.id} className={`rounded-2xl bg-card border p-4 ${isActive ? "border-border" : "border-border opacity-60"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{provider.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{provider.models}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {isActive ? "Actif" : "Désactivé"}
                  </span>
                </div>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <Zap className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">{provider.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <KeyRound className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className={hasSecret ? "text-green-400" : "text-yellow-400"}>
                      {provider.secretKey ? `Clé: ${provider.secretKey}` : "Intégré (platform)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Activity className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Consommation via crédits integration</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleProvider(provider.id)}
                    disabled={saving === provider.id}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isActive ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    }`}
                  >
                    {saving === provider.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
                    {isActive ? "Désactiver" : "Activer"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Config Settings */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Settings2 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-white">Paramètres IA</h3>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          {AI_CONFIG_SETTINGS.map((setting) => {
            const value = getValue(setting.key);
            const changed = editingValues[setting.key] !== undefined;
            return (
              <div key={setting.key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm text-muted-foreground sm:w-72 flex-shrink-0">{setting.label}</label>
                <div className="flex gap-2 flex-1">
                  <input
                    value={value}
                    onChange={(e) => setEditingValues((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                    className="flex-1 h-10 rounded-lg bg-background border border-border px-3 text-sm text-white"
                  />
                  <button
                    onClick={() => handleSaveConfig(setting.key)}
                    disabled={!changed || saving === setting.key}
                    className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-30"
                  >
                    {saving === setting.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white">Note sur les clés API</p>
            <p className="text-xs text-muted-foreground mt-1">
              Les clés API (Anthropic, Gemini, PayDunya) sont gérées de manière sécurisée au niveau de la plateforme.
              Pour remplacer une clé, contactez le support Base44. L'activation/désactivation et la configuration des limites fonctionnent en temps réel ici.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}