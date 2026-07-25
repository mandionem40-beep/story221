import { useState } from "react";
import { Mic } from "lucide-react";
import VoiceLibrary from "@/components/voices/VoiceLibrary";

export default function Voices() {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mic className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Bibliothèque de voix</h1>
            <p className="text-sm text-muted-foreground">
              28 voix IA en 4 langues — clique pour écouter un aperçu instantané
            </p>
          </div>
        </div>
      </div>

      <VoiceLibrary
        selectedId={selectedId}
        onSelect={(voice) => setSelectedId(voice.id)}
      />
    </div>
  );
}