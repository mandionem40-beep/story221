// Verify Places - Détecte les lieux réels dans un prompt et retourne leurs
// caractéristiques visuelles vérifiées (depuis l'entité PlaceReference).
// Peut être appelé depuis le frontend pour prévisualiser les lieux détectés,
// ou depuis le pipeline de génération pour enrichir le prompt.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { verifyPlacesInPrompt } from "../../shared/place-verifier.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Prompt requis" }, { status: 400 });
    }

    const result = await verifyPlacesInPrompt(base44, prompt);

    return Response.json(result);
  } catch (error) {
    console.error("verify-places error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});