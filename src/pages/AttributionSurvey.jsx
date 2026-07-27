import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, ArrowRight, ArrowLeft, Check, Megaphone, Users } from "lucide-react";
import Logo from "@/components/Logo";
import InfluencerAvatar from "@/components/admin/marketing/InfluencerAvatar";
import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";

/* --- Official platform logos (uploaded brand assets) --- */
const LOGOS = {
  facebook: "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/3f9f53832_image.png",
  instagram: "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/5ae3919ed_image.png",
  tiktok: "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/ca745f450_image.png",
  snapchat: "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/fd5e01d57_image.png",
  youtube: "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/025362379_image.png",
  friend: "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/4c267390e_image.png",
};

const NETWORKS = [
  { id: "facebook", label: "Facebook", logo: LOGOS.facebook },
  { id: "instagram", label: "Instagram", logo: LOGOS.instagram },
  { id: "tiktok", label: "TikTok", logo: LOGOS.tiktok },
  { id: "snapchat", label: "Snapchat", logo: LOGOS.snapchat },
  { id: "youtube", label: "YouTube", logo: LOGOS.youtube },
];

const NETWORK_LABELS = {
  facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", snapchat: "Snapchat", youtube: "YouTube",
};

export default function AttributionSurvey() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [network, setNetwork] = useState(null); // Q1 answer
  const [influencers, setInfluencers] = useState([]);
  const [loadingInfluencers, setLoadingInfluencers] = useState(false);

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

  // Load ALL active influencers when a social network is selected
  // Influencers are present on every network — we don't filter by platform.
  // The selected network is recorded separately as how the user discovered Story221.
  useEffect(() => {
    if (!network || network === "friend_recommendation") return;
    setLoadingInfluencers(true);
    base44.entities.MarketingInfluencer.filter({ status: "active" }, "display_order", 200)
      .then(all => setInfluencers(all))
      .catch(() => setInfluencers([]))
      .finally(() => setLoadingInfluencers(false));
  }, [network]);

  const submit = async (source, data = {}) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        user_id: user.id,
        source,
        country: user.country || "",
        user_email: user.email || "",
        user_username: user.username || user.full_name || "",
        ...data,
      };
      if (network && network !== "friend_recommendation") {
        payload.network = network;
      }
      await base44.entities.UserAttribution.create(payload);
      await base44.auth.updateMe({ attribution_completed: true });
      toast({ title: "Bienvenue sur Story221 !", description: "Merci pour votre réponse." });
      navigate(user.role === "admin" || user.role === "super_admin" ? "/admin" : "/app", { replace: true });
    } catch (err) {
      toast({ title: "Erreur", description: "Veuillez réessayer.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleSelectInfluencer = (inf) => {
    submit("influencer", { influencer_id: inf.id, influencer_name: inf.name });
  };

  const handleSelectAd = () => {
    submit("ad");
  };

  const handleFriendRec = () => {
    submit("friend_recommendation");
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
              <h1 className="text-2xl font-bold text-white mb-2">Où avez-vous découvert Story221 ?</h1>
              <p className="text-sm text-muted-foreground">Sélectionnez une option pour continuer.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {NETWORKS.map(net => (
                <button
                  key={net.id}
                  onClick={() => { setNetwork(net.id); setStep(2); }}
                  className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/40 transition-all gpu"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
                    {net.logo ? (
                      <Image src={net.logo} alt={net.label} fittingType="fit" className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#962fbf] flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white">{net.label}</span>
                </button>
              ))}

              {/* Friend recommendation — special card */}
              <button
                onClick={() => { setNetwork("friend_recommendation"); }}
                className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/40 transition-all gpu"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
                  <Image src={LOGOS.friend} alt="Recommandation d'un ami" fittingType="fit" className="w-full h-full" />
                </div>
                <span className="text-sm font-semibold text-white text-center">Recommandation d'un ami</span>
              </button>
            </div>
          </div>
        )}

        {/* Friend recommendation confirmation */}
        {step === 1 && network === "friend_recommendation" && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setNetwork(null)}>
            <div className="bg-popover border border-border rounded-3xl p-6 w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden mx-auto mb-4">
                <Image src={LOGOS.friend} alt="Recommandation d'un ami" fittingType="fit" className="w-full h-full" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Recommandation d'un ami</h3>
              <p className="text-sm text-muted-foreground mb-5">Merci ! Vous pouvez continuer vers Story221.</p>
              <button
                onClick={handleFriendRec}
                disabled={submitting}
                className="w-full h-12 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {submitting ? "Enregistrement..." : "Continuer vers Story221"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && network && network !== "friend_recommendation" && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-2">Qui vous a fait découvrir Story221 ?</h1>
              <p className="text-sm text-muted-foreground">
                Via <span className="text-primary font-medium">{NETWORK_LABELS[network]}</span> — sélectionnez une option.
              </p>
            </div>

            {loadingInfluencers ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Publicité Story221 — always first */}
                <button
                  onClick={handleSelectAd}
                  disabled={submitting}
                  className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-primary/50 bg-gradient-to-br from-primary/15 to-primary/5 hover:border-primary transition-all gpu glow-red-sm"
                >
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded-md bg-primary text-white text-[9px] font-bold uppercase tracking-wide">Story221</span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/20 transition-transform group-hover:scale-110">
                    <Megaphone className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-primary text-center">Publicité Story221</span>
                </button>

                {/* Influencer cards */}
                {influencers.length === 0 && !loadingInfluencers ? (
                  <p className="col-span-full text-sm text-muted-foreground text-center py-4">
                    Aucun influenceur enregistré. Sélectionnez « Publicité Story221 » si vous avez vu une pub.
                  </p>
                ) : (
                  influencers.map(inf => (
                    <button
                      key={inf.id}
                      onClick={() => handleSelectInfluencer(inf)}
                      disabled={submitting}
                      className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/40 transition-all gpu"
                    >
                      <InfluencerAvatar photo_url={inf.photo_url} name={inf.name} size="xl" />
                      <div className="text-center">
                        <span className="text-sm font-semibold text-white block truncate max-w-[120px]">{inf.name}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            <button
              onClick={() => { setStep(1); setNetwork(null); }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white mx-auto transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}