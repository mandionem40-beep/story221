import { cn } from "@/lib/utils";
import HeroNoraVideo from "./HeroNoraVideo";
import HeroCardCharacters from "./HeroCardCharacters";
import HeroCardScene from "./HeroCardScene";
import HeroCardVoice from "./HeroCardVoice";
import HeroCardAd from "./HeroCardAd";
import HeroCardSubtitles from "./HeroCardSubtitles";
import HeroCardMotion from "./HeroCardMotion";

const CARDS = [
  { C: HeroCardCharacters, pos: "md:-top-4 md:-left-4 xl:-left-8", fd: 0 },
  { C: HeroCardScene, pos: "md:-top-4 md:-right-4 xl:-right-8", fd: 0.9 },
  { C: HeroCardSubtitles, pos: "md:top-[38%] md:-left-5 xl:-left-9", fd: 1.8 },
  { C: HeroCardMotion, pos: "md:top-[38%] md:-right-5 xl:-right-9", fd: 2.6 },
  { C: HeroCardVoice, pos: "md:-bottom-4 md:-left-4 xl:-left-8", fd: 1.3 },
  { C: HeroCardAd, pos: "md:-bottom-4 md:-right-4 xl:-right-8", fd: 2.2 },
];

export default function HeroNoraStage() {
  return (
    <div className="relative mx-auto w-fit">
      <HeroNoraVideo />

      {/* Cartes flottantes autour de la vidéo — tablette et desktop */}
      <div className="hidden md:block">
        {CARDS.map(({ C, pos, fd }, i) => (
          <div key={i} className={cn("absolute", pos)}>
            <C delay={0.5 + i * 0.12} floatDelay={fd} />
          </div>
        ))}
      </div>

      {/* Grille compacte — mobile, animations réduites */}
      <div className="md:hidden grid grid-cols-2 gap-3 mt-5 max-w-[360px] mx-auto">
        {CARDS.map(({ C }, i) => (
          <C key={i} delay={0.4 + i * 0.08} float={false} className="w-full" />
        ))}
      </div>
    </div>
  );
}