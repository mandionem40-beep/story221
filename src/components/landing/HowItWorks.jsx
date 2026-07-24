import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Écris ton idée",
    description: "Décris ton concept en une phrase. L'IA s'occupe du reste.",
    icon: "✍️",
  },
  {
    number: "02",
    title: "L'IA crée le scénario",
    description: "Script, scènes, personnages et dialogues générés automatiquement.",
    icon: "🧠",
  },
  {
    number: "03",
    title: "Le film est généré",
    description: "Image, voix, musique et montage assemblés en une vidéo cohérente.",
    icon: "🎬",
  },
  {
    number: "04",
    title: "Publie dans les Reels",
    description: "Ta création rejoint le fil communautaire Story221 automatiquement.",
    icon: "📱",
  },
  {
    number: "05",
    title: "Télécharge ta création",
    description: "Une fois publiée, télécharge ton contenu et partage-le partout.",
    icon: "⬇️",
  },
];

// ECG heartbeat path: flat segments with spikes at each step position
// 5 steps evenly spaced, spike at each step center
function EcgPath({ width = 100, height = 40 }) {
  const segments = steps.length;
  const stepW = width / segments;
  const mid = height / 2;
  let d = `M 0 ${mid}`;
  for (let i = 0; i < segments; i++) {
    const cx = stepW * (i + 0.5);
    const startX = stepW * i;
    // flat line before spike
    d += ` L ${cx - 4} ${mid}`;
    // heartbeat spike: up, peak, down, valley, back
    d += ` L ${cx - 2} ${mid - 14}`;
    d += ` L ${cx} ${mid + 14}`;
    d += ` L ${cx + 2} ${mid - 6}`;
    d += ` L ${cx + 4} ${mid}`;
    // flat line after spike
    d += ` L ${stepW * (i + 1)} ${mid}`;
  }
  return d;
}

export default function HowItWorks() {
  const pathD = EcgPath({ width: 100, height: 40 });

  return (
    <section className="relative py-20 lg:py-28 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Comment ça marche</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            De l'idée au film en <span className="gradient-text-red">5 étapes</span>
          </h2>
        </div>

        <div className="relative">
          {/* ECG heartbeat line - desktop only */}
          <div className="hidden lg:block absolute top-0 left-0 right-0 -translate-y-1/2" style={{ top: "2rem" }}>
            <svg
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
              className="w-full h-20 overflow-visible"
            >
              {/* faint base path */}
              <path d={pathD} fill="none" stroke="rgba(255,0,51,0.15)" strokeWidth="0.4" />
              {/* animated glow path */}
              <motion.path
                d={pathD}
                fill="none"
                stroke="#ff0033"
                strokeWidth="0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 0 3px #ff0033) drop-shadow(0 0 6px rgba(255,0,51,0.6))" }}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 0.5 }}
              />
              {/* flowing LED dot traveling step by step */}
              <motion.circle
                r="1.2"
                fill="#ff4466"
                style={{ filter: "drop-shadow(0 0 4px #ff0033) drop-shadow(0 0 8px #ff0033)" }}
              >
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  path={pathD}
                  rotate="auto"
                />
              </motion.circle>
            </svg>
          </div>

          {/* ECG heartbeat line - mobile vertical (between stacked steps) */}
          <div className="lg:hidden absolute left-7 top-16 bottom-16 w-20 pointer-events-none">
            <svg
              viewBox="0 0 40 100"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <path
                d="M 20 0 L 20 100"
                fill="none"
                stroke="rgba(255,0,51,0.2)"
                strokeWidth="0.5"
                strokeDasharray="2 3"
              />
              <motion.line
                x1="20"
                y1="0"
                x2="20"
                y2="100"
                stroke="#ff0033"
                strokeWidth="0.6"
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 3px #ff0033) drop-shadow(0 0 6px rgba(255,0,51,0.6))" }}
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 0.5 }}
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-6 lg:gap-4 relative">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-2xl mb-4 group hover:border-primary/40 transition-colors">
                    {step.icon}
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center glow-red-sm">
                      {i + 1}
                    </span>
                    {/* pulsing ring */}
                    <span className="absolute inset-0 rounded-2xl border border-primary/0 group-hover:border-primary/30 animate-pulse" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}