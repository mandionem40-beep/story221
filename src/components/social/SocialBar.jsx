import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TikTokIcon, InstagramIcon, YouTubeIcon, FacebookIcon, XIcon, LinkedInIcon, SnapchatIcon } from "./SocialIcons";

const iconMap = {
  tiktok: TikTokIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  facebook: FacebookIcon,
  x: XIcon,
  linkedin: LinkedInIcon,
  snapchat: SnapchatIcon,
};

const sizeMap = {
  sm: { box: "w-9 h-9", icon: "w-4 h-4", gap: "gap-2" },
  md: { box: "w-11 h-11", icon: "w-5 h-5", gap: "gap-2.5" },
  lg: { box: "w-14 h-14", icon: "w-6 h-6", gap: "gap-3" },
};

export default function SocialBar({ size = "md", className = "" }) {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    base44.entities.SocialLink.filter({ active: true }, "display_order", 20)
      .then((items) => setLinks(items || []))
      .catch(() => {});
  }, []);

  if (links.length === 0) return null;

  const { box, icon, gap } = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex flex-wrap items-center ${gap} ${className}`}>
      {links.map((link) => {
        const Icon = iconMap[link.platform];
        if (!Icon) return null;
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label || link.platform}
            title={link.label || link.platform}
            className={`${box} rounded-xl bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground transition-all duration-300 hover:text-primary hover:border-primary/50 hover:bg-primary/10 hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] hover:-translate-y-0.5`}
          >
            <Icon className={icon} />
          </a>
        );
      })}
    </div>
  );
}