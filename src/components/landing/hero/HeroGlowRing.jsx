export default function HeroGlowRing() {
  return (
    <div className="absolute -inset-3 pointer-events-none" aria-hidden="true">
      {/* Halo doux derrière la fenêtre */}
      <div className="absolute -inset-6 bg-primary/20 blur-[70px] rounded-full" />
      {/* Lignes rouges lumineuses animées qui circulent autour de la vidéo */}
      <div className="absolute -inset-2 rounded-[1.9rem] overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 w-[220%] aspect-square -translate-x-1/2 -translate-y-1/2 animate-spin-slow opacity-70"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, transparent 55deg, #ff0033 85deg, transparent 115deg, transparent 180deg, transparent 235deg, #ff0033 265deg, transparent 295deg)",
          }}
        />
      </div>
    </div>
  );
}