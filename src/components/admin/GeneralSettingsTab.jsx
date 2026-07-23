import { useState, useEffect } from "react";
import { GENERAL_SETTINGS, SEO_SETTINGS, CMS_PAGES, loadSettings, saveSetting } from "@/lib/admin-settings";
import { Globe, Search, FileText, Loader2, Save, Building2, Megaphone } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

function SettingRow({ setting, value, onChange, onSave, saving }) {
  const isLong = setting.key.startsWith("cms_");
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground">{setting.label}</label>
      <div className="flex gap-2">
        {isLong ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={8}
            className="flex-1 rounded-lg bg-background border border-border px-3 py-2 text-sm text-white resize-y font-mono"
            placeholder={`Contenu de "${setting.label}"...`}
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 h-10 rounded-lg bg-background border border-border px-3 text-sm text-white"
          />
        )}
        <button
          onClick={onSave}
          disabled={saving}
          className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-30 h-10 flex-shrink-0"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

export default function GeneralSettingsTab() {
  const [section, setSection] = useState("general");
  const [settings, setSettings] = useState({});
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [general, seo, cms, aiConfig] = await Promise.all([
      loadSettings("general"),
      loadSettings("seo"),
      loadSettings("cms"),
      loadSettings("ai_config"),
    ]);
    setSettings({ general, seo, cms, ai_config: aiConfig });
    setEdits({});
    setLoading(false);
  };

  const getValue = (category, key, defaultVal = "") => {
    if (edits[key] !== undefined) return edits[key];
    return settings[category]?.[key]?.value || defaultVal;
  };

  const handleSave = async (category, key, defaultVal) => {
    setSaving(key);
    try {
      const value = edits[key] !== undefined ? edits[key] : getValue(category, key, defaultVal);
      await saveSetting(key, value, category);
      setSettings((prev) => ({
        ...prev,
        [category]: { ...prev[category], [key]: { ...prev[category]?.[key], value } },
      }));
      setEdits((prev) => { const n = { ...prev }; delete n[key]; return n; });
      toast({ title: "Enregistré", description: "Modification appliquée immédiatement." });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
    setSaving(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;
  }

  const sections = [
    { id: "general", label: "Général", icon: Building2 },
    { id: "seo", label: "SEO", icon: Search },
    { id: "cms", label: "Pages CMS", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Paramètres</h2>
        <p className="text-sm text-muted-foreground mt-1">Gérez les paramètres du site, le SEO et les pages CMS. Tout est appliqué en temps réel.</p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              section === s.id ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground hover:text-white"
            }`}
          >
            <s.icon className="w-4 h-4" />
            {s.label}
          </button>
        ))}
      </div>

      {/* General Settings */}
      {section === "general" && (
        <div className="rounded-2xl bg-card border border-border p-5 space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-white">Informations du site</h3>
          </div>
          {GENERAL_SETTINGS.map((s) => (
            <SettingRow
              key={s.key}
              setting={s}
              value={getValue("general", s.key, s.default)}
              onChange={(v) => setEdits((prev) => ({ ...prev, [s.key]: v }))}
              onSave={() => handleSave("general", s.key, s.default)}
              saving={saving === s.key}
            />
          ))}
        </div>
      )}

      {/* SEO Settings */}
      {section === "seo" && (
        <div className="rounded-2xl bg-card border border-border p-5 space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-white">Optimisation SEO</h3>
          </div>
          {SEO_SETTINGS.map((s) => (
            <SettingRow
              key={s.key}
              setting={s}
              value={getValue("seo", s.key, s.default)}
              onChange={(v) => setEdits((prev) => ({ ...prev, [s.key]: v }))}
              onSave={() => handleSave("seo", s.key, s.default)}
              saving={saving === s.key}
            />
          ))}
        </div>
      )}

      {/* CMS Pages */}
      {section === "cms" && (
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-white">Pages CMS</h3>
          </div>
          <p className="text-xs text-muted-foreground">Modifiez le contenu des pages légales et informatives. Utilisez du texte simple ou du HTML basique.</p>
          {CMS_PAGES.map((page) => (
            <div key={page.key} className="rounded-2xl bg-card border border-border p-4">
              <SettingRow
                setting={{ key: page.key, label: page.label, default: "" }}
                value={getValue("cms", page.key, "")}
                onChange={(v) => setEdits((prev) => ({ ...prev, [page.key]: v }))}
                onSave={() => handleSave("cms", page.key, "")}
                saving={saving === page.key}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}