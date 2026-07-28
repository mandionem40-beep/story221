import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import AppleIcon from "@/components/AppleIcon";

export default function Login() {
  const navigate = useNavigate();
  const { checkUserAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      const me = await base44.auth.me();
      await checkUserAuth();
      navigate(me?.role === "super_admin" || me?.role === "admin" ? "/admin" : "/app", { replace: true });
    } catch (err) {
      setError(err.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    setSocialLoading("google");
    const ref = new URLSearchParams(window.location.search).get("ref");
    const dest = ref ? `/complete-profile?ref=${ref}` : "/app";
    base44.auth.loginWithProvider("google", dest);
  };

  const handleApple = () => {
    setSocialLoading("apple");
    const ref = new URLSearchParams(window.location.search).get("ref");
    const dest = ref ? `/complete-profile?ref=${ref}` : "/app";
    base44.auth.loginWithProvider("apple", dest);
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Bon retour"
      subtitle="Connectez-vous à votre compte Story221"
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button
          variant="outline"
          className="h-12 text-sm font-medium"
          onClick={handleGoogle}
          disabled={socialLoading !== null}
        >
          {socialLoading === "google" ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <GoogleIcon className="w-5 h-5 mr-2" />
          )}
          {socialLoading === "google" ? "Redirection..." : "Google"}
        </Button>
        <Button
          variant="outline"
          className="h-12 text-sm font-medium"
          onClick={handleApple}
          disabled={socialLoading !== null}
        >
          {socialLoading === "apple" ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <AppleIcon className="w-5 h-5 mr-2" />
          )}
          {socialLoading === "apple" ? "Redirection..." : "Apple"}
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
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connexion...
            </>
          ) : (
            "Se connecter"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}