import { base44 } from "@/api/base44Client";

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

    // Extract the error message from various possible formats
    let errorMsg = "Une erreur est survenue. Vos diamants ont été remboursés.";

    if (typeof error === "string") {
      errorMsg = error;
    } else if (error?.message) {
      errorMsg = error.message;
    } else if (error?.error) {
      errorMsg = typeof error.error === "string" ? error.error : error.error.message || JSON.stringify(error.error);
    } else if (error?.data?.error) {
      errorMsg = error.data.error;
    }

    // Clean up common error message prefixes for clarity
    if (errorMsg.includes("Échec de la direction créative")) {
      errorMsg = "Le moteur créatif IA a rencontré un problème. Vos diamants ont été remboursés. Détails: " + errorMsg;
    }

    onError({ message: errorMsg, refunded: error?.refunded || true });
  }
}