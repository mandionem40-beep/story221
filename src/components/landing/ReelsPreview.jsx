import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, Music2 } from "lucide-react";

const reelPreviews = [
  {
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/070883f44_Fruits_anims.mp4",
    title: "Une fraise amoureuse d'une banane 🍓🍌",
    author: "@studio221",
    likes: "124.5K",
    comments: "3.2K",
    shares: "8.9K",
    song: "Cinematic AI - Story221",
  },
  {
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/19e99103c_Pub_BRT_Sngal.mp4",
    title: "Pub BRT Dakar 🚌✨ #Senegal",
    author: "@ad_lab",
    likes: "211.8K",
    comments: "5.4K",
    shares: "12.3K",
    song: "Afro Future - Teranga Beat",
  },
  {
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/bbb4bdd93_Monument_Renaissance.mp4",
    title: "Le Monument qui monte la lune 🌙",
    author: "@motion.afrik",
    likes: "89.3K",
    comments: "1.7K",
    shares: "4.1K",
    song: "Epic Night - Viral Mix",
  },
  {
    video_url: "https://media.base44.com/videos/public/6a60e6aa3a8e9910256fd580/4afc24e70_Diomaye_avion.mp4",
    title: "Diomaye descend de l'avion ✈️🇸🇳",
    author: "@aisha_creates",
    likes: "342.1K",
    comments: "9.8K",
    shares: "21.5K",
    song: "Hype Beat - Story221",
  },
];

function ReelFeed() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % reelPreviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const reel = reelPreviews[index];

  return (
    <div className="relative w-[260px] sm:w-[300px] h-[520px] rounded-[2.5rem] bg-card border-2 border-border p-2 overflow-hidden">
      <div className="w-full h-full rounded-[2rem] bg-black overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <video
              src={reel.video_url}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          </motion.div>
        </AnimatePresence>

        {/* Right action rail */}
        <div className="absolute right-2 bottom-20 flex flex-col items-center gap-5 z-10">
          <div className="flex flex-col items-center gap-1">
            <Heart className="w-7 h-7 text-white fill-primary" />
            <span className="text-white text-[10px] font-semibold">{reel.likes}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MessageCircle className="w-7 h-7 text-white" />
            <span className="text-white text-[10px] font-semibold">{reel.comments}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Bookmark className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <Share2 className="w-7 h-7 text-white" />
            <span className="text-white text-[10px] font-semibold">{reel.shares}</span>
          </div>
          <div className="w-9 h-9 rounded-full border-2 border-white/40 flex items-center justify-center animate-spin-slow" style={{ animation: "spin 4s linear infinite" }}>
            <Music2 className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Bottom caption */}
        <div className="absolute left-3 right-16 bottom-4 z-10">
          <p className="text-white font-semibold text-sm">{reel.author}</p>
          <p className="text-white/90 text-xs mt-1 leading-snug">{reel.title}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Music2 className="w-3 h-3 text-white flex-shrink-0" />
            <p className="text-white/80 text-[11px] truncate">{reel.song}</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {reelPreviews.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ReelsPreview() {
  return (
    <section id="reels" className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="text-center lg:text-left">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Story221 Reels</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Un réseau social <span className="gradient-text-red">de créateurs</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg">
              Toutes les créations Story221 sont publiées dans la communauté avant téléchargement. Likez, commentez, partagez et suivez vos créateurs préférés.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: Heart, title: "Likez vos vidéos préférées", desc: "Un like par utilisateur, des compteurs réels." },
                { icon: MessageCircle, title: "Commentez et échangez", desc: "Une communauté active autour de chaque création." },
                { icon: Bookmark, title: "Ajoutez en favoris", desc: "Retrouvez facilement les contenus qui vous inspirent." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Phone mockup with real reels */}
          <div className="relative flex justify-center">
            <ReelFeed />
            {/* Floating like badge */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -right-2 top-16 flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary text-white text-xs font-semibold glow-red z-20"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              +1
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}