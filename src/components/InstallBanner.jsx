import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("s221_install_dismissed")) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    let timer;
    if (!isStandalone) {
      timer = setTimeout(() => setVisible(true), 1500);
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
      dismiss();
    } else {
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      alert(
        isIOS
          ? "Pour installer Story221 : appuyez sur le bouton Partager puis « Sur l'écran d'accueil »."
          : "Ajoutez Story221 à votre écran d'accueil via le menu « Installer l'application » de votre navigateur."
      );
    }
  };

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("s221_install_dismissed", "1");
  };

  if (!visible) return null;

  return (
    <div className="w-full bg-primary text-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Download className="w-3.5 h-3.5 flex-shrink-0" />
          <p className="text-xs sm:text-sm font-medium truncate">
            Installez l'application Story221 en 1 clic
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="px-3 py-1 rounded-md bg-white text-primary text-xs font-semibold hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            Installer
          </button>
          <button
            onClick={dismiss}
            aria-label="Fermer"
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}