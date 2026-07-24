import { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Upload, Users, Heart, Eye, Sparkles, Loader2, Edit, Save, X } from "lucide-react";
import DiamondIcon from "@/components/DiamondIcon";
import { Image } from "@/components/ui/image";
import { toast } from "@/components/ui/use-toast";
import ReferralDashboard from "@/components/referral/ReferralDashboard";
import NotificationPreferences from "@/components/NotificationPreferences";

export default function Profile() {
  const { currentUser, refreshUser } = useOutletContext();
  const [stats, setStats] = useState({ creations: 0, likes: 0, followers: 0, following: 0, views: 0 });
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(currentUser?.username || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [country, setCountry] = useState(currentUser?.country || "Sénégal");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStats();
    setUsername(currentUser?.username || "");
    setBio(currentUser?.bio || "");
    setCountry(currentUser?.country || "Sénégal");
    setAvatarUrl(currentUser?.avatar_url || "");
  }, [currentUser]);

  const loadStats = async () => {
    try {
      const [gens, follows, myFollows] = await Promise.all([
        base44.entities.Generation.filter({ created_by_id: currentUser?.id }),
        base44.entities.Follow.filter({ followed_id: currentUser?.id }),
        base44.entities.Follow.filter({ created_by_id: currentUser?.id }),
      ]);
      // Get likes on my reels
      const myReelIds = (gens.filter(g => g.is_published) || []).map(g => g.reel_id).filter(Boolean);
      let totalLikes = 0;
      let totalViews = 0;
      if (myReelIds.length > 0) {
        const myReels = await base44.entities.Reel.filter({ created_by_id: currentUser?.id });
        totalViews = myReels.filter(r => myReelIds.includes(r.id)).reduce((sum, r) => sum + (r.views || 0), 0);
        for (const reelId of myReelIds.slice(0, 10)) {
          try {
            const likes = await base44.entities.Like.filter({ reel_id: reelId });
            totalLikes += likes.length;
          } catch { /* ignore */ }
        }
      }
      setStats({
        creations: gens.length,
        likes: totalLikes,
        followers: follows.length,
        following: myFollows.length,
        views: totalViews,
      });
    } catch { /* ignore */ }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setAvatarUrl(result.file_url);
    } catch { /* ignore */ }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({
        username: username.trim(),
        full_name: username.trim(),
        bio: bio.trim(),
        country,
        avatar_url: avatarUrl,
      });
      refreshUser();
      setEditing(false);
      toast({ title: "Profil mis à jour" });
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de mettre à jour.", variant: "destructive" });
    }
    setSaving(false);
  };

  const diamonds = currentUser?.diamonds ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8">
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-primary" />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold border-2 border-primary">
              {(username || "U").charAt(0).toUpperCase()}
            </div>
          )}
          {editing && (
            <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer">
              {uploading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Upload className="w-4 h-4 text-white" />}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left min-w-0 w-full">
          {editing ? (
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s+/g, "_"))}
              className="text-lg sm:text-xl font-bold text-white bg-transparent border-b border-border focus:border-primary outline-none px-1 w-full"
              minLength={3}
              maxLength={30}
            />
          ) : (
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">@{username || "utilisateur"}</h1>
          )}
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{country}</p>
          {!editing && currentUser?.phone && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">{currentUser.phone}</p>
          )}
          {!editing && bio && <p className="text-sm text-white/70 mt-2 break-words">{bio}</p>}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? <><Save className="w-4 h-4" />Enregistrer</> : <><Edit className="w-4 h-4" />Modifier</>}
          </button>
          {editing && (
            <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {editing && (
        <div className="mb-8 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Parlez de vous..."
              className="w-full min-h-[80px] rounded-xl bg-card border border-border p-3 text-sm text-white resize-y"
              maxLength={200}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Pays</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full h-11 rounded-xl bg-card border border-border px-3 text-sm text-white">
              {["Sénégal","Côte d'Ivoire","Mali","Burkina Faso","Guinée","Bénin","Togo","Niger","Cameroun","Congo","France","Autre"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
        {[
          { icon: Sparkles, label: "Créations", value: stats.creations },
          { icon: Eye, label: "Vues", value: stats.views },
          { icon: Heart, label: "Likes reçus", value: stats.likes },
          { icon: Users, label: "Abonnés", value: stats.followers },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-card border border-border p-3 sm:p-4 text-center">
            <s.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mx-auto mb-1.5 sm:mb-2" />
            <p className="text-lg sm:text-xl font-bold text-white">{s.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Diamonds */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-transparent border border-primary/20 p-4 sm:p-5 mb-6 sm:mb-8 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <DiamondIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Diamants</p>
            <p className="text-base sm:text-lg font-bold text-white flex items-center gap-1">
              {diamonds}
              <DiamondIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </p>
          </div>
        </div>
        <Link to="/app/diamonds" className="text-xs sm:text-sm text-primary hover:underline flex-shrink-0">Acheter</Link>
      </div>

      {/* Notification Preferences */}
      <NotificationPreferences currentUser={currentUser} />

      {/* Referral Dashboard */}
      <ReferralDashboard currentUser={currentUser} />
    </div>
  );
}