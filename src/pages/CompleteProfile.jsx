import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Phone, CheckCircle2, UserCheck } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import ProfilePhotoUpload from "@/components/auth/ProfilePhotoUpload";
import CountryCodeSelect from "@/components/auth/CountryCodeSelect";
import { countryPrefixes, isValidPhone } from "@/lib/phone-utils";
import { generateReferralCode } from "@/lib/generation-utils";
import { toast } from "@/components/ui/use-toast";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+221");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      if (u?.full_name) setUsername(u.full_name);
      else if (u?.email) setUsername(u.email.split("@")[0]);
      if (u?.avatar_url) setAvatarUrl(u.avatar_url);
      // Check if profile already complete
      if (u?.username && u?.phone && u?.avatar_url) {
        const dest = u.role === "admin" || u.role === "super_admin" ? "/admin" : (u.attribution_completed ? "/app" : "/attribution-survey");
        navigate(dest, { replace: true });
        return;
      }
      setLoading(false);
    }).catch(() => navigate("/login", { replace: true }));
  }, [navigate]);

  const detectedCountry = countryPrefixes.find((c) => c.prefix === phonePrefix);
  const fullPhone = `${phonePrefix}${phoneNumber.trim()}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (username.trim().length < 3) {
      setError("Le nom d'utilisateur doit comporter au moins 3 caractères.");
      return;
    }
    if (!phoneNumber.trim() || !isValidPhone(fullPhone)) {
      setError("Numéro de téléphone invalide.");
      return;
    }
    if (!avatarUrl) {
      setError("La photo de profil est obligatoire.");
      return;
    }

    setSaving(true);
    try {
      const refCodeGen = user?.referral_code || generateReferralCode(username.trim());
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get("ref");
      await base44.auth.updateMe({
        username: username.trim(),
        full_name: username.trim(),
        phone: fullPhone,
        phone_country: detectedCountry?.country || "Sénégal",
        country: detectedCountry?.country || "Sénégal",
        avatar_url: avatarUrl,
        referral_code: refCodeGen,
        referred_by: user?.referred_by || refCode || null,
      });
      // Notify referrer if this user was referred
      const finalRefCode = user?.referred_by || refCode;
      if (finalRefCode) {
        base44.functions.invoke("process-referral", { action: "track_signup" }).catch(() => {});
      }
      toast({ title: "Profil complété !", description: "Bienvenue sur Story221." });
      const dest = user?.role === "admin" || user?.role === "super_admin" ? "/admin" : "/attribution-survey";
      window.location.href = dest;
    } catch (err) {
      setError(err.message || "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <AuthLayout
      icon={UserCheck}
      title="Complétez votre profil"
      subtitle="Finalisez votre inscription pour commencer à créer"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Photo de profil <span className="text-destructive">*</span></Label>
          <ProfilePhotoUpload
            value={avatarUrl}
            onChange={setAvatarUrl}
            googlePhotoUrl={user?.avatar_url}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Nom d'utilisateur <span className="text-destructive">*</span></Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              autoFocus
              placeholder="votre_nom"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s+/g, "_"))}
              className="pl-10 h-12"
              required
              minLength={3}
              maxLength={30}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Numéro de téléphone <span className="text-destructive">*</span></Label>
          <div className="flex gap-2">
            <CountryCodeSelect value={phonePrefix} onChange={setPhonePrefix} />
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="77 123 45 67"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\s]/g, ""))}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>
          {detectedCountry && (
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {detectedCountry.flag} {detectedCountry.country}
            </div>
          )}
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Finaliser mon profil"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}