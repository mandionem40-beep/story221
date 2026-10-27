import AutoVideo from "@/components/ui/auto-video";

export default function HeroVignette({ src, title, delay = 0 }) {
  return (
    <div
      className="group relative rounded-2xl overflow-hidden bg-card border border-border shadow-xl hover:border-primary/50 transition-colors animate-float"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative aspect-[9/16] bg-black">
        <AutoVideo
          src={src}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {title && (
          <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
            <p className="text-[10px] text-white font-medium line-clamp-1">{title}</p>
          </div>
        )}
      </div>
    </div>
  );
}