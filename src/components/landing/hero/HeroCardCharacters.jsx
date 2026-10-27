import { motion, useReducedMotion } from "framer-motion";
import { Users } from "lucide-react";
import HeroCard from "./HeroCard";
import { Image } from "@/components/ui/image";

const COUPLE_IMAGE =
  "https://media.base44.com/images/public/6a60e6aa3a8e9910256fd580/d3495904e_generated_image.png";

export default function HeroCardCharacters({ delay = 0, floatDelay = 0, float = true, className }) {
  const reduce = useReducedMotion();
  return (
    <HeroCard label="Personnages IA" icon={Users} delay={delay} floatDelay={floatDelay} float={float} className={className}>
      <motion.div
        className="relative aspect-square rounded-xl overflow-hidden bg-black"
        animate={reduce ? undefined : { scale: [1, 1.04, 1], rotate: [-0.6, 0.6, -0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image src={COUPLE_IMAGE} className="w-full h-full" fittingType="fill" alt="Couple de personnages IA Story221" />
      </motion.div>
    </HeroCard>
  );
}