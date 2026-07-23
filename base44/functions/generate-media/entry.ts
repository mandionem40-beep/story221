// Generate Media - Fonction backend unifiée
// Valide l'auth, déduit les crédits, lance le pipeline IA, rembourse en cas d'échec

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { calculateCost, deductCredits, refundCredits, sendNotification } from "../../shared/credit-service.ts";
import { runGenerationPipeline } from "../../shared/ai-orchestrator.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { generationId, prompt, type, options, mode, previousGeneration } = body;

    if (!generationId || !prompt || !type) {
      return Response.json({ error: "Paramètres manquants: generationId, prompt, type requis" }, { status: 400 });
    }

    // Get the Generation record
    const generation = await base44.asServiceRole.entities.Generation.get(generationId);
    if (!generation) return Response.json({ error: "Génération introuvable" }, { status: 404 });

    // Verify ownership
    if (generation.created_by_id !== user.id) {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Prevent re-running completed generations
    if (generation.status === "completed") {
      return Response.json({ error: "Cette génération est déjà terminée" }, { status: 400 });
    }

    // Calculate cost
    const cost = generation.cost_diamonds || calculateCost(type, (options && options.duration) || 1);

    // Deduct credits (secure, server-side)
    let deduction;
    try {
      deduction = await deductCredits(base44, user.id, generationId, cost);
    } catch (e) {
      return Response.json({ error: e.message }, { status: 400 });
    }

    // Send start notification
    await sendNotification(
      base44,
      user.id,
      "Génération démarrée",
      `Votre création est en cours de génération.`,
      "system"
    );

    // Run the full AI pipeline
    try {
      const result = await runGenerationPipeline(base44, {
        prompt,
        type,
        options,
        generationId,
        mode: mode || "create",
        previousGeneration: previousGeneration || null,
      });

      // Send completion notification
      await sendNotification(
        base44,
        user.id,
        "Génération terminée",
        `Votre création "${result.title}" est prête.`,
        "system"
      );

      return Response.json(result);
    } catch (error) {
      console.error("Pipeline failed:", error.message);

      // Refund on failure
      try {
        await refundCredits(base44, user.id, generationId, cost);
      } catch (refundErr) {
        console.error("Refund failed:", refundErr.message);
      }

      // Mark generation as failed
      try {
        await base44.asServiceRole.entities.Generation.update(generationId, {
          status: "failed",
          pipeline_step: null,
        });
      } catch { /* ignore */ }

      // Send failure notification
      await sendNotification(
        base44,
        user.id,
        "Génération échouée",
        `Une erreur est survenue. Vos ${cost} diamants ont été remboursés.`,
        "system"
      );

      return Response.json(
        { error: error.message, refunded: true, cost },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("generate-media error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});