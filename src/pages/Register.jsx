import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Mail, Lock, User, Phone, Loader2, Gift, CheckCircle2 } from "lucide-react";
import ProfilePhotoUpload from "@/components/auth/ProfilePhotoUpload";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/AppleIcon";
import CountryCodeSelect from "@/components/auth/CountryCodeSelect";
import { toast } from "@/components/ui/use-toast";
import { generateReferralCode } from "@/lib/generation-utils";
import { countryPrefixes, detectCountryFromPhone, isValidPhone } from "@/lib/phone-utils";

export default function Register() {
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const refCode = urlParams.get("ref");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+221");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Track referral click when visiting with ?ref=CODE
  useEffect(() => {
    if (!refCode) return;
    const clickKey = `ref_click_${refCode}`;
    if (sessionStorage.getItem(clickKey)) return; // already tracked this session
    sessionStorage.setItem(clickKey, "1");
    base44.functions.invoke("process-referral", { action: "track_click", referral_code: refCode, source: "register_page" }).catch(() => {});
  }, [refCode]);

  const fullPhone = `${phonePrefix}${phoneNumber.trim()}`;
  const detectedCountry = countryPrefixes.find((c) => c.prefix === phonePrefix);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (username.trim().length < 3) {
      setError("Le nom d'utilisateur doit comporter au moins 3 caractères.");
      return;
    }
    if (!phoneNumber.trim()) {
      setError("Le numéro de téléphone est obligatoire.");
      return;
    }
    if (!isValidPhone(fullPhone)) {
      setError("Numéro de téléphone invalide.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }
    if (!avatarUrl) {
      setError("La photo de profil est obligatoire.");
      return;
    }
    if (!acceptCGU) {
      setError("Vous devez accepter les Conditions d'utilisation et la Politique de confidentialité.");
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      await base44.auth.register({ email: cleanEmail, password });
      setEmail(cleanEmail);
      setShowOtp(true);
    } catch (err) {
      const msg = err.message || "L'inscription a échoué";
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exist")) {
        setError("Cet email est déjà utilisé.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: email.trim().toLowerCase(), otpCode });
      if (!result?.access_token) {
        throw new Error("Réponse invalide du serveur. Veuillez réessayer.");
      }
      base44.auth.setToken(result.access_token);
      const refCodeGen = generateReferralCode(username.trim());
      await base44.auth.updateMe({
        username: username.trim(),
        full_name: username.trim(),
        phone: fullPhone,
        phone_country: detectedCountry?.country || "Sénégal",
        country: detectedCountry?.country || "Sénégal",
        avatar_url: avatarUrl,
        referral_code: refCodeGen,
        referred_by: refCode || null,
        diamonds: 0,
        free_trial_used: false,
        role: "user",
      });
      window.location.href = "/app";
    } catch (err) {
      setError(err.message || "Code de vérification invalide");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email.trim().toLowerCase());
      toast({ title: "Code envoyé", description: "Vérifiez votre boîte mail et vos spams." });
      setResendCooldown(45);
    } catch (err) {
      setError(err.message || "Échec de l'envoi du code");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", "/complete-profile");
  };

  const handleApple = () => {
    base44.auth.loginWithProvider("apple", "/complete-profile");
  };

  if (showOtp) {
    return (
      <AuthLayout
        icon={Mail}
        title="Vérifiez votre email"
        subtitle={`Un code a été envoyé à ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Vérification...
            </>
          ) : (
            "Vérifier"
          )}
        </Button>
        <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border space-y-1">
          <p className="text-xs text-muted-foreground text-center">
            💡 Pas de code ? Vérifiez vos <strong>Spams</strong> / Courriers indésirables.
          </p>
          <p className="text-xs text-muted-foreground text-center">
            Ajoutez <strong className="text-foreground">app@base44.com</strong> à vos contacts pour garantir la réception.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Pas reçu le code ?{" "}
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-primary font-medium hover:underline disabled:text-muted-foreground disabled:no-underline"
          >
            {resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : "Renvoyer"}
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Créer mon compte"
      subtitle="Rejoignez le premier studio IA social d'Afrique"
      footer={
        <>
          Déjà un compte ?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      {/* Social login */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button
          variant="outline"
          className="h-12 text-sm font-medium"
          onClick={handleGoogle}
        >
          <GoogleIcon className="w-5 h-5 mr-2" />
          Google
        </Button>
        <Button
          variant="outline"
          className="h-12 text-sm font-medium"
          onClick={handleApple}
        >
          <AppleIcon className="w-5 h-5 mr-2" />
          Apple
        </Button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">ou</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Photo de profil <span className="text-destructive">*</span></Label>
          <ProfilePhotoUpload value={avatarUrl} onChange={setAvatarUrl} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Nom d'utilisateur</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
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
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">
            Numéro de téléphone
            <span className="text-destructive ml-1">*</span>
          </Label>
          <div className="flex gap-2">
            <CountryCodeSelect value={phonePrefix} onChange={setPhonePrefix} />
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
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
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
              minLength={6}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmer le mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
              minLength={6}
            />
          </div>
        </div>
        <div className="flex items-start gap-2 pt-1">
          <Checkbox
            id="cgu"
            checked={acceptCGU}
            onCheckedChange={setAcceptCGU}
            className="mt-0.5"
          />
          <label htmlFor="cgu" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
            J'accepte les{" "}
            <a href="#" className="text-primary hover:underline">Conditions d'utilisation</a>
            {" "}et la{" "}
            <a href="#" className="text-primary hover:underline">Politique de confidentialité</a>
          </label>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <Gift className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Recevez gratuitement votre première génération vidéo après votre inscription.
          </p>
        </div>

        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Création...
            </>
          ) : (
            "Créer mon compte"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}