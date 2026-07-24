// Auto Edit Video - Montage automatique à partir d'une vidéo existante
import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { deductCredits, refundCredits, sendNotification } from "../../shared/credit-service.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { montageId, adjustmentId, adjustmentPrompt } = body;

    if (!montageId) {
      return Response.json({ error: "montageId requis" }, { status: 400 });
    }

    const montage = await base44.asServiceRole.entities.Montage.get(montageId);
    if (!montage) return Response.json({ error: "Montage introuvable" }, { status: 404 });
    if (montage.created_by_id !== user.id) {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    const isAdjustment = !!adjustmentId;
    const cost = isAdjustment ? 5 : (montage.cost_diamonds || 15);
    const deductionRef = isAdjustment ? `adj_${adjustmentId}` : `montage_${montageId}`;

    // Deduct credits
    let deduction;
    try {
      deduction = await deductCredits(base44, user.id, deductionRef, cost);
    } catch (e) {
      return Response.json({ error: e.message }, { status: 400 });
    }

    // Update status
    if (isAdjustment) {
      await base44.asServiceRole.entities.MontageAdjustment.update(adjustmentId, { status: "processing" });
    } else {
      await base44.asServiceRole.entities.Montage.update(montageId, { status: "processing" });
    }

    try {
      let videoPrompt;
      let planText = "";

      if (isAdjustment) {
        // Targeted adjustment: use previous result + adjustment prompt
        videoPrompt = `Vidéo déjà montée: ${montage.result_url}. Ajustement demandé: ${adjustmentPrompt}. ` +
          `Preset original: ${montage.preset_name}. Prompt original: ${montage.prompt}. ` +
          `Applique uniquement cet ajustement ciblé sans re-générer l'intégralité du montage.`;
      } else {
        // Full montage: analyze video and create plan
        const planResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Tu es un monteur vidéo professionnel. Analyse cette vidéo et crée un plan de montage détaillé.

Vidéo source: ${montage.source_video_url}
Style demandé: ${montage.preset_name || "Non spécifié"}
Instructions: ${montage.prompt}

Crée un plan incluant: moments forts, points de coupe, transitions, zooms, textes/sous-titres, effets sonores, musique.
Génère ensuite un prompt visuel détaillé pour recréer cette vidéo montée dans le style demandé.`,
          file_urls: [montage.source_video_url],
          response_json_schema: {
            type: "object",
            properties: {
              montage_plan: { type: "string" },
              video_prompt: { type: "string" }
            }
          }
        });

        planText = planResponse.montage_plan || "";
        videoPrompt = planResponse.video_prompt || `${montage.prompt}. Style: ${montage.preset_name}.`;

        // Save plan
        await base44.asServiceRole.entities.Montage.update(montageId, {
          montage_plan: planText,
        });
      }

      // Generate the edited video
      const videoResult = await base44.asServiceRole.integrations.Core.GenerateVideo({
        prompt: videoPrompt,
        duration: 6,
        aspect_ratio: "16:9"
      });

      // Update records
      if (isAdjustment) {
        await base44.asServiceRole.entities.MontageAdjustment.update(adjustmentId, {
          status: "completed",
          result_url: videoResult.url,
        });
        await base44.asServiceRole.entities.Montage.update(montageId, {
          result_url: videoResult.url,
        });
      } else {
        await base44.asServiceRole.entities.Montage.update(montageId, {
          status: "completed",
          result_url: videoResult.url,
        });
      }

      await sendNotification(
        base44, user.id,
        isAdjustment ? "Ajustement terminé" : "Montage terminé",
        isAdjustment ? "Votre ajustement a été appliqué." : "Votre vidéo montée est prête.",
        "system"
      );

      return Response.json({
        success: true,
        result_url: videoResult.url,
        montage_plan: planText,
        cost,
      });
    } catch (error) {
      console.error("auto-edit-video error:", error.message);
      try {
        await refundCredits(base44, user.id, deductionRef, cost);
      } catch {}

      if (isAdjustment) {
        await base44.asServiceRole.entities.MontageAdjustment.update(adjustmentId, { status: "failed" });
      } else {
        await base44.asServiceRole.entities.Montage.update(montageId, { status: "failed" });
      }

      await sendNotification(
        base44, user.id,
        "Montage échoué",
        `Une erreur est survenue. ${cost} diamants remboursés.`,
        "system"
      );

      return Response.json({ error: error.message, refunded: true, cost }, { status: 500 });
    }
  } catch (error) {
    console.error("auto-edit-video error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});