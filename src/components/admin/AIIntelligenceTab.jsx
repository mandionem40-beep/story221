import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Brain,
  Loader2,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  ThumbsDown,
  Lightbulb,
} from "lucide-react";

function topN(obj, n = 5) {
  return Object.entries(obj || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

function StatCard({ icon: Icon, label, value, accent = "primary" }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${accent}/10 text-${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-white leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function AIIntelligenceTab() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const gens = await base44.entities.Generation.list("-created_date", 500);

        const byStatus = {};
        const byType = {};
        const byStyle = {};
        const byLanguage = {};
        const stepErrors = {};
        gens.forEach((g) => {
          byStatus[g.status] = (byStatus[g.status] || 0) + 1;
          if (g.type) byType[g.type] = (byType[g.type] || 0) + 1;
          if (g.style) byStyle[g.style] = (byStyle[g.style] || 0) + 1;
          if (g.language) byLanguage[g.language] = (byLanguage[g.language] || 0) + 1;
          if (g.status === "failed" && g.pipeline_step)
            stepErrors[g.pipeline_step] = (stepErrors[g.pipeline_step] || 0) + 1;
        });

        const total = gens.length;
        const completed = byStatus.completed || 0;
        const failed = byStatus.failed || 0;
        const successRate = total ? Math.round((completed / total) * 100) : 0;
        const failureRate = total ? Math.round((failed / total) * 100) : 0;

        // Satisfaction
        let sat = [];
        let avgRating = 0;
        const tagCounts = {};
        try {
          sat = await base44.entities.GenerationSatisfaction.list("-created_date", 500);
          if (sat.length) {
            avgRating = sat.reduce((a, s) => a + (s.rating || 0), 0) / sat.length;
            sat.forEach((s) =>
              (s.improvement_tags || []).forEach((t) => {
                tagCounts[t] = (tagCounts[t] || 0) + 1;
              })
            );
          }
        } catch (e) {
          /* entity may be empty */
        }

        // Corrections
        let corrections = [];
        const correctionReasons = {};
        try {
          corrections = await base44.entities.CorrectionRecord.list("-created_date", 500);
          corrections.forEach((c) => {
            if (c.reason) correctionReasons[c.reason] = (correctionReasons[c.reason] || 0) + 1;
          });
        } catch (e) {
          /* ignore */
        }

        // Failure patterns
        let patterns = [];
        try {
          patterns = await base44.entities.FailurePattern.filter({ active: true }, "display_order", 20);
        } catch (e) {
          /* ignore */
        }

        // Project memories (continuity coverage)
        let projectMemories = 0;
        let userProfiles = 0;
        try {
          const pm = await base44.entities.ProjectMemory.list("-updated_date", 1);
          projectMemories = pm.length;
        } catch (e) {}
        try {
          const up = await base44.entities.UserCreativeProfile.list("-updated_date", 1);
          userProfiles = up.length;
        } catch (e) {}

        setStats({
          total,
          completed,
          failed,
          successRate,
          failureRate,
          byType: topN(byType),
          byStyle: topN(byStyle),
          byLanguage: topN(byLanguage),
          stepErrors: topN(stepErrors),
          satCount: sat.length,
          avgRating: avgRating.toFixed(1),
          tagCounts: topN(tagCounts, 6),
          correctionCount: corrections.length,
          correctionReasons: topN(correctionReasons, 6),
          patterns,
          projectMemories,
          userProfiles,
        });
      } catch (e) {
        console.error("AI Intelligence load failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        Impossible de charger les données d'intelligence IA.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-white">Intelligence IA Story221</h2>
      </div>
      <p className="text-sm text-muted-foreground -mt-3">
        Données réelles agrégées depuis les générations, évaluations, corrections et erreurs connues.
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Brain} label="Générations totales" value={stats.total} />
        <StatCard icon={CheckCircle2} label="Taux de réussite" value={`${stats.successRate}%`} accent="green-500" />
        <StatCard icon={XCircle} label="Taux d'échec" value={`${stats.failureRate}%`} accent="destructive" />
        <StatCard icon={Star} label="Satisfaction moyenne" value={`${stats.avgRating}/5`} accent="yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Improvement Report */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-white">AI Improvement Report</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-muted-foreground mb-1.5">Types de vidéos populaires</p>
              <div className="flex flex-wrap gap-1.5">
                {stats.byType.length === 0 ? (
                  <span className="text-muted-foreground/50">—</span>
                ) : (
                  stats.byType.map(([k, v]) => (
                    <span key={k} className="px-2 py-1 rounded-lg bg-secondary text-white">{k} · {v}</span>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-1.5">Styles populaires</p>
              <div className="flex flex-wrap gap-1.5">
                {stats.byStyle.length === 0 ? (
                  <span className="text-muted-foreground/50">—</span>
                ) : (
                  stats.byStyle.map(([k, v]) => (
                    <span key={k} className="px-2 py-1 rounded-lg bg-secondary text-white">{k} · {v}</span>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-1.5">Langues populaires</p>
              <div className="flex flex-wrap gap-1.5">
                {stats.byLanguage.length === 0 ? (
                  <span className="text-muted-foreground/50">—</span>
                ) : (
                  stats.byLanguage.map(([k, v]) => (
                    <span key={k} className="px-2 py-1 rounded-lg bg-secondary text-white">{k} · {v}</span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Frequent errors & corrections */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-semibold text-white">Problèmes récurrents</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-muted-foreground mb-1.5 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Erreurs par étape de pipeline
              </p>
              {stats.stepErrors.length === 0 ? (
                <p className="text-muted-foreground/50">Aucune erreur enregistrée.</p>
              ) : (
                <ul className="space-y-1">
                  {stats.stepErrors.map(([k, v]) => (
                    <li key={k} className="flex justify-between">
                      <span className="text-white">{k}</span>
                      <span className="text-destructive font-semibold">{v}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="text-muted-foreground mb-1.5 flex items-center gap-1">
                <ThumbsDown className="w-3.5 h-3.5" /> Corrections fréquentes
              </p>
              {stats.correctionReasons.length === 0 ? (
                <p className="text-muted-foreground/50">Aucune correction enregistrée.</p>
              ) : (
                <ul className="space-y-1">
                  {stats.correctionReasons.map(([k, v]) => (
                    <li key={k} className="flex justify-between">
                      <span className="text-white capitalize">{k}</span>
                      <span className="text-yellow-500 font-semibold">{v}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="text-muted-foreground mb-1.5">Tags d'amélioration demandés</p>
              {stats.tagCounts.length === 0 ? (
                <p className="text-muted-foreground/50">Aucune évaluation enregistrée.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {stats.tagCounts.map(([k, v]) => (
                    <span key={k} className="px-2 py-1 rounded-lg bg-secondary text-white">{k} · {v}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Memory coverage */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} label="Mémoires de projet" value={stats.projectMemories} />
        <StatCard icon={Brain} label="Profils créateurs" value={stats.userProfiles} />
        <StatCard icon={Star} label="Évaluations" value={stats.satCount} accent="yellow-500" />
        <StatCard icon={AlertTriangle} label="Corrections" value={stats.correctionCount} accent="yellow-500" />
      </div>

      {/* Known failure patterns */}
      <div className="rounded-2xl bg-card border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h3 className="text-sm font-semibold text-white">Erreurs connues (Known Failure Patterns)</h3>
        </div>
        {stats.patterns.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Aucun pattern d'erreur enregistré. Ajoute-en pour que Claude les évite lors des prochaines générations.
          </p>
        ) : (
          <ul className="space-y-2">
            {stats.patterns.map((p) => (
              <li key={p.id} className="flex items-start gap-2 text-xs">
                <span className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium flex-shrink-0">
                  {p.error_type || p.category}
                </span>
                <span className="text-white">{p.lesson}</span>
                <span className="text-muted-foreground ml-auto flex-shrink-0">×{p.occurrence_count || 0}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}