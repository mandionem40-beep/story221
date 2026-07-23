import Logo from "@/components/Logo";
import SocialBar from "@/components/social/SocialBar";

const footerLinks = {
  "À propos": ["Notre histoire", "Équipe", "Carrières", "Blog"],
  "Légal": ["Politique de confidentialité", "Conditions d'utilisation", "Mentions légales"],
  "Support": ["Centre d'aide", "Contact", "Signaler un problème"]
};


export default function Footer() {
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
            <div className="mt-6">
              <SocialBar size="sm" />
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) =>
          <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4 hidden">{title}</h4>
              <ul className="space-y-2.5 hidden">
                {links.map((link) =>
              <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
              )}
              </ul>
            </div>
          )}
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
    </footer>);

}