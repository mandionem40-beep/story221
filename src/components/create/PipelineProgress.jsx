import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

export default function PipelineProgress({ steps, currentStep, error }) {
  const percent = error ? 100 : Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-white">Génération en cours</h2>
        <p className="text-sm text-muted-foreground mt-1">Votre création est en cours de production...</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full bg-primary glow-red-sm"
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{error ? "Échec" : "Traitement..."}</span>
          <span>{percent}%</span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep && !error;
          const isFailed = i === currentStep && error;
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isFailed
                  ? "bg-destructive/5 border-destructive/30"
                  : isActive
                  ? "bg-primary/5 border-primary/30"
                  : isDone
                  ? "bg-card border-border"
                  : "bg-card/50 border-border/50 opacity-50"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isFailed ? "bg-destructive/20" : isActive ? "bg-primary/20" : isDone ? "bg-green-500/20" : "bg-secondary"
              }`}>
                {isFailed ? (
                  <span className="text-destructive text-sm">✕</span>
                ) : isDone ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <span className="text-lg">{step.icon}</span>
                )}
              </div>
              <span className={`text-sm font-medium ${
                isActive ? "text-white" : isDone ? "text-muted-foreground" : "text-muted-foreground/50"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive font-medium mb-1">La génération a échoué</p>
          <p className="text-xs text-muted-foreground">{error.message || "Une erreur est survenue. Vos diamants ont été remboursés."}</p>
        </div>
      )}
    </div>
  );
}