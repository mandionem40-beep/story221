import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

    let timer;
    if (!isStandalone) {
      timer = setTimeout(() => setVisible(true), 1800);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setVisible(false);
    } else {
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if (isIOS) {
        alert("Pour installer Story221 : appuyez sur le bouton Partager (ios) puis « Sur l'écran d'accueil ».");
      } else {
        alert("Ajoutez Story221 à votre écran d'accueil via le menu de votre navigateur « Installer l'application ».");
      }
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-lg animate-slide-up">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/90 border border-primary/30 glow-red-sm backdrop-blur-xl">
        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Download className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Installer Story221</p>
          <p className="text-xs text-muted-foreground truncate">Accès en 1 clic, directement sur votre écran.</p>
        </div>
        <button
          onClick={handleInstall}
          className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          Installer
        </button>
        <button
          onClick={() => setVisible(false)}
          aria-label="Fermer"
          className="text-muted-foreground hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}