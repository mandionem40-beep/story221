import { Film } from "lucide-react";
import HeroCard from "./HeroCard";
import { Image } from "@/components/ui/image";

const SCENE_IMAGE =
  "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/71550b7b1_image.png";

export default function HeroCardScene({ delay = 0, floatDelay = 0, float = true, className }) {
  return (
    <HeroCard label="Scènes réalistes" icon={Film} delay={delay} floatDelay={floatDelay} float={float} className={className}>
      <div className="relative aspect-square rounded-xl overflow-hidden bg-black">
        <Image
          src={SCENE_IMAGE}
          className="w-full h-full animate-ken-burns"
          fittingType="fill"
          alt="Décor cinématographique du Sénégal"
        />
      </div>
    </HeroCard>
  );
}