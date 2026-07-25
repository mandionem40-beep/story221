import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share, Share2, Plus } from "lucide-react";
import Logo from "@/components/Logo";

/**
 * InstallBanner — PWA install prompt for Android (Chrome), iOS (Safari),
 * and desktop browsers.
 *
 * Android/Chrome: uses the `beforeinstallprompt` event for a native
 * one-click install experience.
 * iOS/Safari: shows step-by-step instructions for "Add to Home Screen"
 * (iOS does not support beforeinstallprompt).
 * Desktop: shows manual install instructions.
 *
 * The banner hides permanently once the app is installed (appinstalled event
 * or standalone display-mode detected).
 */
export default function InstallBanner() {
  const deferredPromptRef = useRef(null);
  const [hasPrompt, setHasPrompt] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [showDesktopHelp, setShowDesktopHelp] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect if already running as an installed PWA
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches ||
      window.matchMedia("(display-mode: window-controls-overlay)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Don't show if already installed or dismissed this session
    if (standalone) return;
    if (sessionStorage.getItem("s221_install_dismissed")) return;

    // Detect iOS Safari (no beforeinstallprompt support)
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Capture beforeinstallprompt (Android Chrome / desktop Chromium)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setHasPrompt(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Hide permanently when the app is actually installed
    const handleAppInstalled = () => {
      setVisible(false);
      setHasPrompt(false);
      deferredPromptRef.current = null;
      sessionStorage.setItem("s221_install_dismissed", "1");
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    // Show banner after a short delay
    const showTimer = setTimeout(() => setVisible(true), 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(showTimer);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = deferredPromptRef.current;
    if (prompt) {
      prompt.prompt();
      const choice = await prompt.userChoice;
      deferredPromptRef.current = null;
      setHasPrompt(false);
      if (choice.outcome === "accepted") {
        dismiss();
      }
    } else if (isIOS) {
      setShowIOSHelp(true);
    } else {
      setShowDesktopHelp(true);
    }
  };

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("s221_install_dismissed", "1");
  };

  // Don't render if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-[100] sm:max-w-sm sm:left-auto sm:right-6 sm:bottom-6"
        >
          <div className="rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-3.5">
              <div className="flex-shrink-0">
                <Logo size="sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-tight">Installer Story221</p>
                <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                  {isIOS
                    ? "Ajoutez l'app à votre écran d'accueil"
                    : hasPrompt
                    ? "Installation en 1 clic disponible"
                    : "Story221 sur votre écran"}
                </p>
              </div>
              <button
                onClick={dismiss}
                aria-label="Fermer"
                className="flex-shrink-0 w-7 h-7 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action area */}
            <div className="px-3.5 pb-3.5">
              {showIOSHelp ? (
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-lg bg-secondary/60 space-y-2">
                    <div className="flex items-start gap-2">
                      <Share className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-white leading-snug">
                        <span className="font-bold text-primary">1.</span> Appuyez sur le bouton{" "}
                        <span className="font-bold text-primary">Partager</span> en bas de Safari
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Plus className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-white leading-snug">
                        <span className="font-bold text-primary">2.</span> Sélectionnez{" "}
                        <span className="font-bold text-primary">« Sur l'écran d'accueil »</span>
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Download className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-white leading-snug">
                        <span className="font-bold text-primary">3.</span> Appuyez sur{" "}
                        <span className="font-bold text-primary">« Ajouter »</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={dismiss}
                    className="w-full h-9 rounded-lg bg-primary text-white text-xs font-semibold"
                  >
                    J'ai compris
                  </button>
                </div>
              ) : showDesktopHelp ? (
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-secondary/60">
                    <p className="text-[11px] text-white leading-snug">
                      <span className="font-bold text-primary">Chrome / Edge :</span> cliquez sur
                      l'icône « Installer » <Download className="inline w-3 h-3" /> dans la barre
                      d'adresse, ou Menu (⋮) → « Installer Story221 ».
                    </p>
                    <p className="text-[11px] text-white leading-snug mt-2">
                      <span className="font-bold text-primary">Safari :</span> Partager → « Sur
                      l'écran d'accueil ».
                    </p>
                  </div>
                  <button
                    onClick={dismiss}
                    className="w-full h-9 rounded-lg bg-primary text-white text-xs font-semibold"
                  >
                    J'ai compris
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleInstall}
                  className="w-full h-9 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 glow-red-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Installer en 1 clic
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}