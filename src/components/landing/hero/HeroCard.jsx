import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function HeroCard({
  label,
  icon: Icon,
  delay = 0,
  floatDelay = 0,
  float = true,
  className,
  children,
}) {
  const reduce = useReducedMotion();
  return (
    <div
      className={cn(float && !reduce && "animate-float")}
      style={{ animationDelay: `${floatDelay}s` }}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        whileHover={reduce ? undefined : { y: -5 }}
        className={cn(
          "w-28 xl:w-32 rounded-2xl border border-primary/40 bg-secondary/80 backdrop-blur p-2.5",
          "shadow-lg shadow-black/50 hover:border-primary",
          "hover:shadow-[0_10px_36px_rgba(255,0,51,0.22)] transition-[border-color,box-shadow] duration-300",
          className
        )}
      >
        <div className="flex items-center gap-1.5 mb-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-primary shrink-0" />}
          <span className="text-[11px] font-semibold text-white truncate">{label}</span>
        </div>
        {children}
      </motion.div>
    </div>
  );
}