import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share, Share2, Smartphone } from "lucide-react";
import DiamondIcon from "@/components/DiamondIcon";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("s221_install_dismissed")) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (!isStandalone) {
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(timer);
      };
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      dismiss();
    }
    // iOS & autres: on garde le popup ouvert avec les instructions
  };

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("s221_install_dismissed", "1");
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={dismiss}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
          />

          {/* Bottom sheet popup */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-[101] sm:max-w-md sm:mx-auto sm:rounded-t-3xl rounded-t-3xl bg-card border-t border-border overflow-hidden"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Close button */}
            <button
              onClick={dismiss}
              aria-label="Fermer"
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-white transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-6 pb-8 pt-3">
              {/* App icon + glow */}
              <div className="flex flex-col items-center text-center mb-5">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: "spring", damping: 18 }}
                  className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-3 glow-red"
                >
                  <DiamondIcon className="w-10 h-10" />
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-2 border-card">
                    <Download className="w-3 h-3 text-white" />
                  </div>
                </motion.div>
                <h3 className="text-lg font-bold text-white">Installer Story221</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Accédez au studio IA en un clic depuis votre écran d'accueil.
                </p>
              </div>

              {/* Feature bullets */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { icon: Smartphone, label: "1 clic" },
                  { icon: DiamondIcon, label: "Crédits offerts" },
                  { icon: Download, label: "Hors-ligne" },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.08 }}
                    className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-secondary/50"
                  >
                    <f.icon className="w-4 h-4 text-primary" />
                    <span className="text-[11px] text-muted-foreground font-medium">{f.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* iOS instructions OR install button */}
              {isIOS && !deferredPrompt ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2.5 mb-4"
                >
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/60">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Share className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs text-white leading-snug">
                      Appuyez sur le bouton <span className="font-bold text-primary">Partager</span> en bas de Safari.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/60">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Share2 className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs text-white leading-snug">
                      Sélectionnez <span className="font-bold text-primary">« Sur l'écran d'accueil »</span>.
                    </p>
                  </div>
                  <button
                    onClick={dismiss}
                    className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    J'ai compris
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={handleInstall}
                  className="w-full h-12 rounded-xl bg-primary text-white text-sm font-bold flex items-center justify-center gap-2 glow-red-sm"
                >
                  <Download className="w-4 h-4" />
                  Installer maintenant
                </button>
              )}

              <button
                onClick={dismiss}
                className="w-full text-center text-xs text-muted-foreground hover:text-white transition-colors mt-2"
              >
                Plus tard
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}