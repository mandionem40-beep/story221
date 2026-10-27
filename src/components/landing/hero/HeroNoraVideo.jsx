import { useState } from "react";
import { Play, VolumeX } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import HeroGlowRing from "./HeroGlowRing";
import { NORA_AD_URL } from "./noraAdUrl";

export default function HeroNoraVideo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-[240px] md:w-[260px] xl:w-[290px] mx-auto">
      <HeroGlowRing />

      <div className="relative aspect-[9/16] rounded-[1.6rem] overflow-hidden border border-primary/40 bg-black shadow-2xl shadow-primary/25">
        {/* Publicité Bio NORA — lecture en boucle, muette, adaptée au format */}
        <video
          src={NORA_AD_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover" />
        

        <span className="absolute top-3 left-3 text-[10px] font-semibold text-white bg-black/60 backdrop-blur rounded-full px-2.5 py-1 border border-primary/30">
          Publicité · Bio NORA
        </span>

        {/* Lecture avec le son */}
        <button
          onClick={() => setOpen(true)}
          aria-label="Lire la publicité Bio NORA avec le son"
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-primary/95 text-white flex items-center justify-center shadow-lg shadow-primary/50 transition-transform duration-300 hover:scale-110 opacity-0">
          
          <Play className="w-6 h-6 ml-0.5" />
        </button>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-white/80 bg-black/50 backdrop-blur rounded-full px-3 py-1.5">
          <span className="flex items-center gap-1.5">
            <VolumeX className="w-3 h-3" /> Lecture en boucle · Sans son
          </span>
          <span className="text-primary">HD</span>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[340px] p-2 bg-black border-primary/40">
          <video src={NORA_AD_URL} controls autoPlay playsInline className="w-full rounded-xl" />
        </DialogContent>
      </Dialog>
    </div>);

}