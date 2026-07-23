import { useState, useEffect } from "react";
import { Instagram, Facebook, Youtube, Music2 } from "lucide-react";
import Logo from "@/components/Logo";
import { base44 } from "@/api/base44Client";

const footerLinks = {
  "À propos": ["Notre histoire", "Équipe", "Carrières", "Blog"],
  "Légal": ["Politique de confidentialité", "Conditions d'utilisation", "Mentions légales"],
  "Support": ["Centre d'aide", "Contact", "Signaler un problème"],
};

const socials = [
  { icon: Music2, label: "TikTok", key: "social_tiktok" },
  { icon: Instagram, label: "Instagram", key: "social_instagram" },
  { icon: Facebook, label: "Facebook", key: "social_facebook" },
  { icon: Youtube, label: "YouTube", key: "social_youtube" },
];

export default function Footer() {
  const [links, setLinks] = useState({});

  useEffect(() => {
    base44.entities.AppSetting.list()
      .then((settings) => {
        const map = {};
        (settings || []).forEach((s) => { map[s.key] = s.value; });
        setLinks(map);
      })
      .catch(() => {});
  }, []);

  const configuredSocials = socials.filter((s) => links[s.key]);

  return (
    <footer className="relative border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo + description */}
          <div className="col-span-2">
            <a href="#hero" className="mb-4 inline-block">
              <Logo size="md" />
            </a>
            <p className="text-sm text-muted-foreground max-w-xs">
              Le premier studio IA social d'Afrique. Créez des films, vidéos et histoires à partir d'un simple prompt.
            </p>
            {configuredSocials.length > 0 && (
              <div className="flex gap-3 mt-6">
                {configuredSocials.map((social) => (
                  <a
                    key={social.label}
                    href={links[social.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Story221. Tous droits réservés.
          </p>
          <p className="text-xs text-muted-foreground">
            Conçu en Afrique, pour le monde. 🌍
          </p>
        </div>
      </div>
    </footer>
  );
}