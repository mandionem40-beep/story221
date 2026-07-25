import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, ArrowRight, ArrowLeft, Check, Megaphone, Users } from "lucide-react";
import Logo from "@/components/Logo";
import { toast } from "@/components/ui/use-toast";

/* --- Platform SVG logos (simple-icons paths, brand colors) --- */
const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>
);
const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0Zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.86.052-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.273-.045 1.649-.06 4.859-.06l.045.03Zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162ZM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4Zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439Z"/></svg>
);
const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.07-1.03-2.02-1.19-3.44-3.37-3.57-5.7-.02-.5-.03-1-.01-1.49.12-1.55.75-3.05 1.72-4.18 1.12-1.34 2.75-2.24 4.48-2.48.03 1.42-.04 2.84-.01 4.25-.75.25-1.46.67-1.97 1.3-.57.71-.86 1.63-.79 2.54.05 1.27.96 2.44 2.18 2.83 1.04.35 2.24.13 3.06-.66.71-.66 1.04-1.62 1.04-2.58.01-4.39 0-8.78.01-13.17-.01-.28.09-.56.27-.76Z"/></svg>
);
const SnapchatIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12.166.004C8.026-.074 4.328 3.32 4.079 7.463c-.04 1.353.024 2.7-.062 4.054-.117 1.426-.762 2.736-1.546 3.917-.676 1.072-1.555 2.063-1.945 3.297-.153.597.338 1.165.918 1.302 1.234.358 2.532.357 3.806.466.179.084.182.338.278.491.083.415.473.895.936.726 1.298-.271 2.469-.953 3.747-1.293 1.3-.343 2.66-.329 3.983-.099 1.215.235 2.387.753 3.626.887.473.027.847-.443.92-.876.082-.209.107-.443.184-.654.25-.083.535-.05.798-.098.845-.103 1.728-.157 2.489-.584.469-.323.418-1.033.121-1.447-.616-1.244-1.615-2.241-2.283-3.453-.724-1.346-1.36-2.797-1.338-4.36-.058-1.353.044-2.71-.04-4.063C20.769 3.398 17.707.283 13.916.058 13.341.022 12.753-.011 12.166.004Z"/></svg>
);
const YouTubeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"/></svg>
);

const NETWORKS = [
  { id: "facebook", label: "Facebook", color: "#1877F2", Icon: FacebookIcon },
  { id: "instagram", label: "Instagram", color: "#E4405F", Icon: InstagramIcon },
  { id: "tiktok", label: "TikTok", color: "#69C9D0", Icon: TikTokIcon },
  { id: "snapchat", label: "Snapchat", color: "#FFFC00", Icon: SnapchatIcon },
  { id: "youtube", label: "YouTube", color: "#FF0000", Icon: YouTubeIcon },
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
        window.location.href = u.role === "admin" || u.role === "super_admin" ? "/admin" : "/app";
        return;
      }
      setLoading(false);
    }).catch(() => navigate("/login", { replace: true }));
  }, [navigate]);

  // Load influencers when a social network is selected
  useEffect(() => {
    if (!network || network === "friend_recommendation") return;
    setLoadingInfluencers(true);
    base44.entities.MarketingInfluencer.filter({ status: "active" }, "display_order", 200)
      .then(all => {
        setInfluencers(all.filter(i => i.primary_social === network));
      })
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
      window.location.href = user.role === "admin" || user.role === "super_admin" ? "/admin" : "/app";
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
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: `${net.color}20` }}
                  >
                    <net.Icon className="w-7 h-7" style={{ color: net.color }} />
                  </div>
                  <span className="text-sm font-semibold text-white">{net.label}</span>
                </button>
              ))}

              {/* Friend recommendation — special card */}
              <button
                onClick={() => { setNetwork("friend_recommendation"); }}
                className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/40 transition-all gpu"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/15 transition-transform group-hover:scale-110">
                  <Users className="w-7 h-7 text-primary" />
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
              <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
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
                    Aucun influenceur {NETWORK_LABELS[network]} enregistré. Sélectionnez « Publicité Story221 » si vous avez vu une pub.
                  </p>
                ) : (
                  influencers.map(inf => (
                    <button
                      key={inf.id}
                      onClick={() => handleSelectInfluencer(inf)}
                      disabled={submitting}
                      className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-border bg-card hover:border-primary/40 transition-all gpu"
                    >
                      {inf.photo_url ? (
                        <img src={inf.photo_url} alt={inf.name} className="w-14 h-14 rounded-2xl object-cover transition-transform group-hover:scale-110" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-xl font-bold text-primary transition-transform group-hover:scale-110">
                          {inf.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="text-center">
                        <span className="text-sm font-semibold text-white block truncate max-w-[120px]">{inf.name}</span>
                        <span className="text-[10px] text-muted-foreground">{NETWORK_LABELS[inf.primary_social] || inf.primary_social}</span>
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