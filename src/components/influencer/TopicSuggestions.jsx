import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dice5, Loader2, RefreshCw, Plus } from "lucide-react";
import { defaultTopicBank } from "@/lib/influencer-data";

export default function TopicSuggestions({ influencer, onSelectTopic }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const generateTopics = async () => {
    setLoading(true);
    const themes = influencer.content_themes || [];
    try {
      const themeStr = themes.length > 0 ? themes.join(", ") : "lifestyle";
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Génère 6 idées de sujets de contenu pour un influenceur IA nommé ${influencer.name}. Thématiques: ${themeStr}. Personnalité: ${influencer.personality_profile || influencer.personality_traits?.join(", ")}. Bio: ${influencer.bio || ""}. Pour chaque sujet, donne un titre court (max 6 mots) et une description d'une phrase. Les sujets doivent être variés, originaux et adaptés à un format vidéo court. Réponds en JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            topics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
      });
      setTopics(result.topics || []);
    } catch {
      // Fallback to default topics from the first theme
      const firstTheme = themes[0] || "Lifestyle";
      const bank = defaultTopicBank[firstTheme] || defaultTopicBank["Lifestyle"] || [];
      setTopics(bank);
    }
    setLoading(false);
  };

  useEffect(() => {
    generateTopics();
  }, [influencer.id]);

  const randomTopic = () => {
    if (topics.length === 0) return;
    const t = topics[Math.floor(Math.random() * topics.length)];
    onSelectTopic(t.title, t.description);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground ml-2">Claude prépare des idées...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">💡 Idées de contenu</h3>
        <div className="flex gap-1.5">
          <button onClick={randomTopic} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
            <Dice5 className="w-3.5 h-3.5" /> Aléatoire
          </button>
          <button onClick={generateTopics} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary border border-border text-muted-foreground text-xs font-medium hover:text-white">
            <RefreshCw className="w-3.5 h-3.5" /> Renouveler
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {topics.map((t, i) => (
          <button
            key={i}
            onClick={() => onSelectTopic(t.title, t.description)}
            className="text-left p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
          >
            <p className="text-sm font-medium text-white line-clamp-2">{t.title}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{t.description}</p>
          </button>
        ))}
      </div>

      <button
        onClick={() => onSelectTopic("", "")}
        className="w-full mt-2 py-2 rounded-xl bg-secondary border border-dashed border-border text-muted-foreground text-xs font-medium hover:text-white flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" /> Écrire ma propre idée
      </button>
    </div>
  );
}