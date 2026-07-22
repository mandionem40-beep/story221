import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";

const reelPreviews = [
  { emoji: "🍓", title: "Mandione & Yama", author: "@creator1", likes: "1.2K", color: "from-pink-500/20 to-red-500/20" },
  { emoji: "🚀", title: "Voyage spatial", author: "@studio221", likes: "856", color: "from-blue-500/20 to-purple-500/20" },
  { emoji: "🏞️", title: "Savane story", author: "@africa_ai", likes: "2.1K", color: "from-amber-500/20 to-orange-500/20" },
  { emoji: "💃", title: "Danse animation", author: "@motion", likes: "643", color: "from-violet-500/20 to-fuchsia-500/20" },
];

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

          {/* Right: Phone mockup with reels */}
          <div className="relative flex justify-center">
            <div className="relative w-[260px] sm:w-[300px] h-[500px] rounded-[2.5rem] bg-card border-2 border-border p-3 overflow-hidden">
              <div className="w-full h-full rounded-[2rem] bg-background overflow-hidden relative">
                {reelPreviews.map((reel, i) => (
                  <motion.div
                    key={reel.title}
                    initial={{ y: i === 0 ? 0 : "100%" }}
                    animate={{ y: i === 0 ? [0, -400, -400] : ["100%", "100%", 0] }}
                    transition={{
                      duration: 8,
                      times: [0, 0.5, 0.5],
                      repeat: Infinity,
                      repeatDelay: 1,
                      delay: i * 4,
                    }}
                    className={`absolute inset-0 bg-gradient-to-b ${reel.color} flex flex-col justify-end p-5`}
                  >
                    <div className="text-6xl text-center mb-auto mt-20">{reel.emoji}</div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white font-semibold text-sm">{reel.title}</p>
                        <p className="text-white/70 text-xs">{reel.author}</p>
                      </div>
                      <div className="flex flex-col gap-4 items-center">
                        <Heart className="w-5 h-5 text-white fill-white" />
                        <MessageCircle className="w-5 h-5 text-white" />
                        <Share2 className="w-5 h-5 text-white" />
                        <Bookmark className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Floating like badge */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -right-2 top-12 flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary text-white text-xs font-semibold glow-red"
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