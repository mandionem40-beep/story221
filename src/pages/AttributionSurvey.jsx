import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, ArrowRight, CheckCircle2, BadgeCheck } from "lucide-react";
import Logo from "@/components/Logo";
import { toast } from "@/components/ui/use-toast";

const CHANNELS = [
  { id: "tiktok", label: "TikTok", emoji: "🎵" },
  { id: "facebook", label: "Facebook", emoji: "📘" },
  { id: "instagram", label: "Instagram", emoji: "📸" },
  { id: "youtube", label: "YouTube", emoji: "▶️" },
  { id: "snapchat", label: "Snapchat", emoji: "👻" },
  { id: "x", label: "X (Twitter)", emoji: "🐦" },
  { id: "linkedin", label: "LinkedIn", emoji: "💼" },
  { id: "whatsapp", label: "WhatsApp", emoji: "💬" },
  { id: "google", label: "Google", emoji: "🔍" },
  { id: "friend_recommendation", label: "Recommandation d'un ami", emoji: "👥" },
  { id: "sponsored_ad", label: "Publicité sponsorisée", emoji: "📢" },
  { id: "influencer", label: "Influenceur", emoji: "⭐" },
  { id: "other", label: "Autre", emoji: "✨" },
];

const AD_PLATFORMS = [
  { id: "tiktok_ads", label: "TikTok Ads" },
  { id: "facebook_ads", label: "Facebook Ads" },
  { id: "instagram_ads", label: "Instagram Ads" },
  { id: "youtube_ads", label: "YouTube Ads" },
  { id: "google_ads", label: "Google Ads" },
  { id: "snapchat_ads", label: "Snapchat Ads" },
  { id: "linkedin_ads", label: "LinkedIn Ads" },
  { id: "other", label: "Autre" },
];

const SOCIAL_LABELS = {
  tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube",
  facebook: "Facebook", snapchat: "Snapchat", x: "X", linkedin: "LinkedIn", other: "Autre",
};

export default function AttributionSurvey() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [channel, setChannel] = useState(null);
  const [influencers, setInfluencers] = useState([]);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [adPlatform, setAdPlatform] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) { navigate("/login", { replace: true }); return; }
      setUser(u);
      if (u.attribution_completed) {
        navigate(u.role === "admin" || u.role === "super_admin" ? "/admin" : "/app", { replace: true });
        return;
      }
      setLoading(false);
    }).catch(() => navigate("/login", { replace: true }));
  }, [navigate]);

  useEffect(() => {
    if (channel === "influencer") {
      base44.entities.MarketingInfluencer.filter({ status: "active" }, "display_order", 200)
        .then(setInfluencers).catch(() => {});
    }
    if (channel === "sponsored_ad") {
      base44.entities.MarketingCampaign.filter({ status: "active" }, "-created_date", 50)
        .then(setCampaigns).catch(() => {});
    }
  }, [channel]);

  const handleSubmit = async () => {
    if (!channel) return;
    if (channel === "influencer" && !selectedInfluencer) return;
    if (channel === "sponsored_ad" && !adPlatform) return;

    setSubmitting(true);
    try {
      const attributionData = {
        user_id: user.id,
        discovery_channel: channel,
        country: user.country || "",
        user_email: user.email || "",
        user_username: user.username || user.full_name || "",
      };
      if (channel === "influencer") {
        attributionData.influencer_id = selectedInfluencer.id;
      }
      if (channel === "sponsored_ad") {
        attributionData.ad_platform = adPlatform;
        // Auto-match campaign by network
        const matchedCampaign = campaigns.find(c => {
          const adNet = adPlatform.replace("_ads", "");
          return c.network === adNet || c.network === adNet.replace("instagram", "facebook");
        });
        if (matchedCampaign) attributionData.campaign_id = matchedCampaign.id;
      }

      await base44.entities.UserAttribution.create(attributionData);
      await base44.auth.updateMe({ attribution_completed: true });
      toast({ title: "Bienvenue sur Story221 !", description: "Merci pour votre réponse." });
      window.location.href = user.role === "admin" || user.role === "super_admin" ? "/admin" : "/app";
    } catch (err) {
      toast({ title: "Erreur", description: "Veuillez réessayer.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 py-8">
      <div className="mb-6">
        <Logo size="md" />
      </div>

      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? "w-12 bg-primary" : "w-8 bg-border"}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? "w-12 bg-primary" : "w-8 bg-border"}`} />
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-2">Comment avez-vous découvert Story221 ?</h1>
              <p className="text-sm text-muted-foreground">Sélectionnez une réponse pour continuer.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CHANNELS.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => { setChannel(ch.id); }}
                  className={`relative flex flex-col items-center gap-1.5 p-4 rounded-2xl border transition-all ${
                    channel === ch.id
                      ? "bg-primary/10 border-primary glow-red-sm"
                      : "bg-card border-border hover:border-primary/40"
                  }`}
                >
                  <span className="text-2xl">{ch.emoji}</span>
                  <span className={`text-xs font-medium text-center ${channel === ch.id ? "text-primary" : "text-white"}`}>
                    {ch.label}
                  </span>
                  {channel === ch.id && (
                    <CheckCircle2 className="absolute top-1.5 right-1.5 w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                if (!channel) return;
                if (channel === "influencer" || channel === "sponsored_ad") {
                  setStep(2);
                } else {
                  handleSubmit();
                }
              }}
              disabled={!channel || submitting}
              className="w-full h-12 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {submitting ? "Enregistrement..." : "Continuer"}
            </button>
          </div>
        )}

        {step === 2 && channel === "influencer" && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-2">Quel influenceur vous a fait découvrir Story221 ?</h1>
              <p className="text-sm text-muted-foreground">Sélectionnez l'influenceur en question.</p>
            </div>

            {influencers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground mb-4">Aucun influenceur n'est disponible pour le moment.</p>
                <button
                  onClick={() => { setChannel("other"); setStep(1); }}
                  className="text-primary text-sm font-medium"
                >
                  Choisir une autre réponse
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {influencers.map(inf => (
                  <button
                    key={inf.id}
                    onClick={() => setSelectedInfluencer(inf)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                      selectedInfluencer?.id === inf.id
                        ? "bg-primary/10 border-primary glow-red-sm"
                        : "bg-card border-border hover:border-primary/40"
                    }`}
                  >
                    {inf.photo_url ? (
                      <img src={inf.photo_url} alt={inf.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                        {inf.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className={`text-sm font-semibold text-center ${selectedInfluencer?.id === inf.id ? "text-primary" : "text-white"}`}>
                      {inf.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{SOCIAL_LABELS[inf.primary_social] || inf.primary_social}</span>
                    {inf.verified && (
                      <BadgeCheck className="absolute top-1.5 right-1.5 w-4 h-4 text-primary" />
                    )}
                    {selectedInfluencer?.id === inf.id && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-primary pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => { setStep(1); setSelectedInfluencer(null); }}
                className="px-4 h-12 rounded-xl bg-secondary border border-border text-sm font-medium text-muted-foreground hover:text-white transition-colors"
              >
                Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedInfluencer || submitting}
                className="flex-1 h-12 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {submitting ? "Enregistrement..." : "Continuer vers Story221"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && channel === "sponsored_ad" && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-2">Sur quelle plateforme avez-vous vu cette publicité ?</h1>
              <p className="text-sm text-muted-foreground">Sélectionnez la plateforme publicitaire.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {AD_PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setAdPlatform(p.id)}
                  className={`flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                    adPlatform === p.id
                      ? "bg-primary/10 border-primary glow-red-sm"
                      : "bg-card border-border hover:border-primary/40"
                  }`}
                >
                  <span className={`text-sm font-medium ${adPlatform === p.id ? "text-primary" : "text-white"}`}>
                    {p.label}
                  </span>
                  {adPlatform === p.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setStep(1); setAdPlatform(null); }}
                className="px-4 h-12 rounded-xl bg-secondary border border-border text-sm font-medium text-muted-foreground hover:text-white transition-colors"
              >
                Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={!adPlatform || submitting}
                className="flex-1 h-12 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {submitting ? "Enregistrement..." : "Continuer vers Story221"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}