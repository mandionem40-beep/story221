import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { runGenerationPipeline } from "@/lib/generation-pipeline";
import { quickDurations, quickFormats, quickMusics } from "@/lib/quick-create-data";
import { buildInfluencerPrompt } from "@/lib/influencer-data";
import DiamondIcon from "@/components/DiamondIcon";
import { X, Loader2, Send, Clock, Lock } from "lucide-react";

export default function CreateInfluencerContent({ influencer, onClose, onPublished }) {
  const navigate = useNavigate();
  const { refreshUser } = useOutletContext();
  const [topic, setTopic] = useState("");
  const [topicDesc, setTopicDesc] = useState("");
  const [duration, setDuration] = useState(quickDurations[1]);
  const [format, setFormat] = useState("vertical");
  const [music, setMusic] = useState("Joyeuse");
  const [mode, setMode] = useState("now"); // "now" | "schedule"
  const [scheduledDate, setScheduledDate] = useState("");
  const [generating, setGenerating] = useState(false);

  const cost = duration.cost;

  const handlePublish = async () => {
    if (!topic.trim()) {
      toast({ title: "Sujet manquant", description: "Choisissez un sujet.", variant: "destructive" });
      return;
    }
    const user = await base44.auth.me();
    if (user.diamonds < cost) {
      toast({ title: "Solde insuffisant", variant: "destructive" });
      navigate("/app/diamonds");
      return;
    }

    if (mode === "schedule" && !scheduledDate) {
      toast({ title: "Date manquante", description: "Sélectionnez une date.", variant: "destructive" });
      return;
    }

    const settings = { duration, format, music };

    if (mode === "schedule") {
      await base44.entities.InfluencerSchedule.create({
        influencer_id: influencer.id,
        scheduled_date: new Date(scheduledDate).toISOString(),
        status: "pending",
        topic: topic.trim(),
        topic_description: topicDesc,
        duration_minutes: duration.minutes,
        format,
        music,
      });
      toast({ title: "Publication planifiée !", description: `Prévue le ${new Date(scheduledDate).toLocaleString("fr-FR")}` });
      onPublished();
      return;
    }

    setGenerating(true);
    const prompt = buildInfluencerPrompt(influencer, topic, settings);
    try {
      const gen = await base44.entities.Generation.create({
        type: "video",
        prompt,
        cost_diamonds: cost,
        duration_minutes: duration.minutes,
        language: influencer.frozen_language || "Français",
        style: influencer.visual_style || "Cinématique",
        format,
        voice: influencer.frozen_voice,
        music,
        resolution: "720p",
        status: "processing",
        pipeline_step: "script",
      });

      await runGenerationPipeline(
        { prompt, type: "video", options: { duration: duration.minutes, language: influencer.frozen_language, style: influencer.visual_style, format, voice: influencer.frozen_voice, music, resolution: "720p" }, generationId: gen.id },
        {
          onComplete: async (res) => {
            const reel = await base44.entities.Reel.create({
              generation_id: gen.id,
              title: `${influencer.name} — ${topic}`,
              video_url: res.videoUrl || res.resultUrl || "",
              thumbnail_url: res.characters?.[0]?.image_url || influencer.avatar_url || "",
              type: "video",
              author_name: influencer.name,
              author_avatar: influencer.avatar_url || "",
              influencer_id: influencer.id,
            });
            await base44.entities.Generation.update(gen.id, { is_published: true, reel_id: reel.id });
            // Update influencer stats
            const reels = await base44.entities.Reel.filter({ influencer_id: influencer.id });
            await base44.entities.Influencer.update(influencer.id, {
              content_count: reels.length,
              total_views: reels.reduce((s, r) => s + (r.views || 0), 0),
            });
            toast({ title: "Publié !", description: `${influencer.name} a publié un nouveau contenu.` });
            base44.functions.invoke("process-referral", { action: "process_reward" }).catch(() => {});
            refreshUser();
            onPublished();
          },
          onError: (err) => {
            toast({ title: "Erreur", description: err?.message || "Génération échouée.", variant: "destructive" });
            setGenerating(false);
          },
        }
      );
    } catch {
      toast({ title: "Erreur", description: "Génération impossible.", variant: "destructive" });
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => !generating && onClose()}>
      <div className="w-full max-w-md rounded-2xl bg-card border border-border p-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Créer du contenu — {influencer.name}</h2>
          <button onClick={() => onClose()} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Locked identity badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 mb-4">
          <Lock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span className="text-[11px] text-white">Identité verrouillée : {influencer.appearance} · {influencer.frozen_voice} · {influencer.visual_style}</span>
        </div>

        {/* Topic */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1.5 block">Sujet du contenu</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex: Mon matin parfait..." maxLength={100}
            className="w-full h-10 rounded-lg bg-secondary border border-border px-3 text-sm text-white" />
          {topicDesc && <p className="text-[10px] text-muted-foreground mt-1">{topicDesc}</p>}
        </div>

        {/* Duration */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1.5 block">Durée</label>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {quickDurations.map(d => (
              <button key={d.id} onClick={() => setDuration(d)}
                className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-lg border ${duration.id === d.id ? "bg-primary/10 border-primary/40" : "bg-secondary border-border"}`}>
                <span className="text-xs font-bold text-white">{d.label}</span>
                <span className="flex items-center gap-0.5 text-[10px] text-primary"><DiamondIcon className="w-2.5 h-2.5" />{d.cost}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1.5 block">Format</label>
          <div className="grid grid-cols-3 gap-2">
            {quickFormats.map(f => (
              <button key={f.id} onClick={() => setFormat(f.id)}
                className={`py-2 rounded-lg border text-xs ${format === f.id ? "bg-primary/10 border-primary/40 text-white" : "bg-secondary border-border text-muted-foreground"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Music */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1.5 block">Musique</label>
          <div className="flex flex-wrap gap-1.5">
            {quickMusics.map(m => (
              <button key={m.id} onClick={() => setMusic(m.id)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs ${music === m.id ? "bg-primary/10 border-primary/40 text-white" : "bg-secondary border-border text-muted-foreground"}`}>
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1.5 block">Publication</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setMode("now")} className={`py-2.5 rounded-lg border text-sm ${mode === "now" ? "bg-primary text-white border-primary" : "bg-secondary border-border text-muted-foreground"}`}>
              <Send className="w-3.5 h-3.5 inline mr-1" /> Maintenant
            </button>
            <button onClick={() => setMode("schedule")} className={`py-2.5 rounded-lg border text-sm ${mode === "schedule" ? "bg-primary text-white border-primary" : "bg-secondary border-border text-muted-foreground"}`}>
              <Clock className="w-3.5 h-3.5 inline mr-1" /> Planifier
            </button>
          </div>
          {mode === "schedule" && (
            <input type="datetime-local" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
              className="w-full h-10 mt-2 rounded-lg bg-secondary border border-border px-3 text-sm text-white" />
          )}
        </div>

        {/* Action */}
        <button onClick={handlePublish} disabled={generating || !topic.trim()}
          className="w-full h-12 rounded-2xl bg-primary text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 glow-red-sm">
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Génération en cours...</>
          ) : mode === "schedule" ? (
            <><Clock className="w-4 h-4" /> Planifier</>
          ) : (
            <><Send className="w-4 h-4" /> Publier · <DiamondIcon className="w-4 h-4" /> {cost}</>
          )}
        </button>
      </div>
    </div>
  );
}