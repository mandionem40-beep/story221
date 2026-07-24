// Generate Demo Video - Génère une vidéo démo d'une plateforme depuis un URL
import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { deductCredits, refundCredits, sendNotification } from "../../shared/credit-service.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { demoId } = body;

    if (!demoId) {
      return Response.json({ error: "demoId requis" }, { status: 400 });
    }

    const demo = await base44.asServiceRole.entities.PlatformDemo.get(demoId);
    if (!demo) return Response.json({ error: "Démo introuvable" }, { status: 404 });
    if (demo.created_by_id !== user.id) {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Check rights confirmation
    if (!demo.rights_confirmed) {
      return Response.json({ error: "Confirmation des droits requise" }, { status: 400 });
    }

    // Check blocked domains
    let urlObj;
    try {
      urlObj = new URL(demo.url);
    } catch {
      return Response.json({ error: "URL invalide" }, { status: 400 });
    }
    const domain = urlObj.hostname.replace(/^www\./, "").toLowerCase();

    const blockedDomains = await base44.asServiceRole.entities.BlockedDomain.filter({ active: true });
    const blockedEntry = blockedDomains.find(b => {
      const bd = b.domain.toLowerCase();
      return domain.includes(bd) || bd.includes(domain);
    });

    if (blockedEntry) {
      await base44.asServiceRole.entities.PlatformDemo.update(demoId, {
        status: "blocked",
        block_reason: `Catégorie sensible: ${blockedEntry.category}. ${blockedEntry.reason || ""}`
      });
      return Response.json({
        error: "Domaine bloqué",
        blocked: true,
        reason: blockedEntry.reason || "Ce domaine appartient à une catégorie sensible."
      }, { status: 403 });
    }

    const cost = demo.cost_diamonds || 10;

    // Deduct credits
    let deduction;
    try {
      deduction = await deductCredits(base44, user.id, `demo_${demoId}`, cost);
    } catch (e) {
      return Response.json({ error: e.message }, { status: 400 });
    }

    await base44.asServiceRole.entities.PlatformDemo.update(demoId, { status: "processing" });

    try {
      // Step 1: Fetch the website
      let siteText = "";
      try {
        const siteResponse = await fetch(demo.url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; Story221DemoBot/1.0)" },
          redirect: "follow",
          signal: AbortSignal.timeout(15000)
        });
        const siteHtml = await siteResponse.text();
        siteText = siteHtml
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 5000);
      } catch (fetchErr) {
        console.error("Site fetch failed:", fetchErr.message);
      }

      // Step 2: Analyze and create script
      const scriptResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Tu es un créateur de vidéos de démonstration professionnel. Crée un script complet pour une vidéo démo du site suivant.

URL: ${demo.url}
Contenu extrait du site: ${siteText || "(contenu non accessible - utilise le contexte web)"}
Personnalisation: ${demo.prompt || "Démo professionnelle standard"}

Crée un script avec: sections clés à présenter, voix off pour chaque section, animations (curseur, zoom, surlignage), ton et rythme.
Génère aussi un prompt visuel pour créer la vidéo.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            script: { type: "string" },
            voiceover_text: { type: "string" },
            video_prompt: { type: "string" }
          }
        }
      });

      const script = scriptResponse;

      // Step 3: Generate voiceover
      let voiceUrl = "";
      try {
        const voiceText = (script.voiceover_text || script.script || "").substring(0, 5000);
        if (voiceText) {
          const voiceResult = await base44.asServiceRole.integrations.Core.GenerateSpeech({
            text: voiceText,
            voice: "storm",
            language_code: "fr"
          });
          voiceUrl = voiceResult.url || "";
        }
      } catch (voiceErr) {
        console.error("Voice generation failed:", voiceErr.message);
      }

      // Step 4: Generate the demo video
      const videoResult = await base44.asServiceRole.integrations.Core.GenerateVideo({
        prompt: `Vidéo de démonstration du site ${demo.url}. ${script.video_prompt || script.script}. Animations: curseur simulé naviguant sur le site, zooms sur les fonctionnalités clés, surlignage des boutons importants. Ton professionnel et dynamique.`,
        duration: 6,
        aspect_ratio: "16:9"
      });

      // Update demo record
      await base44.asServiceRole.entities.PlatformDemo.update(demoId, {
        status: "completed",
        result_url: videoResult.url,
        voice_url: voiceUrl,
      });

      // Check for abnormal volume (5+ demos on different domains in 24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const recentDemos = await base44.asServiceRole.entities.PlatformDemo.filter({
        created_by_id: user.id,
      });

      const recentUnique = new Set();
      for (const d of recentDemos) {
        if (d.created_date && d.created_date >= oneDayAgo) {
          try {
            recentUnique.add(new URL(d.url).hostname);
          } catch {
            recentUnique.add(d.url);
          }
        }
      }

      if (recentUnique.size >= 5) {
        await base44.asServiceRole.entities.AdminLog.create({
          action: "demo_volume_alert",
          details: `Compte ${user.email || user.id} a généré ${recentUnique.size} démos sur des domaines différents en 24h`,
          target_user_id: user.id,
        });
      }

      await sendNotification(
        base44, user.id,
        "Vidéo démo prête",
        `Votre vidéo de démonstration de ${domain} est prête.`,
        "system"
      );

      return Response.json({
        success: true,
        result_url: videoResult.url,
        voice_url: voiceUrl,
        script: script.script,
        cost,
      });
    } catch (error) {
      console.error("generate-demo-video error:", error.message);
      try {
        await refundCredits(base44, user.id, `demo_${demoId}`, cost);
      } catch {}

      await base44.asServiceRole.entities.PlatformDemo.update(demoId, { status: "failed" });

      await sendNotification(
        base44, user.id,
        "Démo échouée",
        `Une erreur est survenue. ${cost} diamants remboursés.`,
        "system"
      );

      return Response.json({ error: error.message, refunded: true, cost }, { status: 500 });
    }
  } catch (error) {
    console.error("generate-demo-video error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});