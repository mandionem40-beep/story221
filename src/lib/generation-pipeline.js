import { base44 } from "@/api/base44Client";
import { getPipelineSteps } from "./generation-utils";

// Frontend pipeline - calls the backend generate-media function
// Real-time progress is handled via Generation entity subscription (see Create.jsx)

export async function runGenerationPipeline(config, callbacks) {
  const { prompt, type, options, generationId, mode, previousGeneration } = config;
  const { onComplete, onError } = callbacks;

  try {
    const response = await base44.functions.invoke("generate-media", {
      prompt,
      type,
      options,
      generationId,
      mode: mode || "create",
      previousGeneration: previousGeneration || null,
    });

    const result = response.data || response;
    onComplete(result);
  } catch (error) {
    console.error("Pipeline error:", error);
    onError(error);
  }
}