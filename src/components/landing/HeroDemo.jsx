import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Sparkles, Film, Mic, Palette, Clapperboard } from "lucide-react";

const pipelineSteps = [
{ icon: Sparkles, label: "Prompt", text: "Une fraise en or tombe amoureuse d'une fraise en argent..." },
{ icon: Film, label: "Scénario", text: "Mandione, une fraise dorée, rencontre Yama, une fraise d'argent..." },
{ icon: Palette, label: "Personnages", text: "Mandione — fraise dorée · Yama — fraise d'argent" },
{ icon: Mic, label: "Voix IA", text: "Synthèse vocale en cours..." },
{ icon: Clapperboard, label: "Film final", text: "Une vidéo complète, prête à publier." }];


export default function HeroDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % pipelineSteps.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const current = pipelineSteps[step];

  return null;
























































































}