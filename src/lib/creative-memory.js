import { base44 } from "@/api/base44Client";

// Story221 Creative Intelligence — memory assembler.
// This runs entirely on the client. It gathers project continuity, the user's
// creative profile, and known failure patterns, then returns a context string
// prepended to the user's prompt before it reaches the backend generation
// function. Claude therefore benefits from accumulated learning WITHOUT any
// backend function change — the memory travels inside the prompt itself.

/**
 * Assemble a Claude-readable memory context for an upcoming generation.
 * @param {Object} opts
 * @param {string} [opts.projectKey]   - project/series key for continuity
 * @param {string} [opts.type]         - generation type (video, film, ...)
 * @param {string} [opts.style]
 * @param {string} [opts.language]
 * @returns {Promise<string>} context block, or "" if nothing relevant
 */
export async function assembleMemoryContext({ projectKey, type, style, language } = {}) {
  const sections = [];

  // --- Project memory (continuity across episodes) ---
  if (projectKey) {
    try {
      const pm = await base44.entities.ProjectMemory.filter(
        { project_key: projectKey },
        "-updated_date",
        1
      );
      if (pm && pm[0]) {
        const m = pm[0];
        const lines = ["## MÉMOIRE DU PROJET (préserve la continuité)"];
        if (m.title) lines.push(`Projet: ${m.title}`);
        if (m.style) lines.push(`Style établi: ${m.style}`);
        if (m.palette) lines.push(`Palette: ${m.palette}`);
        if (m.characters && m.characters.length)
          lines.push(`Personnages (garde identité, apparence et voix identiques):\n${m.characters.map(c => `- ${c}`).join("\n")}`);
        if (m.places && m.places.length)
          lines.push(`Décors récurrents:\n${m.places.map(p => `- ${p}`).join("\n")}`);
        if (m.timeline) lines.push(`Chronologie: ${m.timeline}`);
        if (m.continuity_notes) lines.push(`Notes de continuité: ${m.continuity_notes}`);
        if (m.creative_decisions && m.creative_decisions.length)
          lines.push(`Décisions créatives retenues: ${m.creative_decisions.join("; ")}`);
        sections.push(lines.join("\n"));
      }
    } catch (e) {
      /* non-blocking */
    }
  }

  // --- User creative profile (individual preferences) ---
  try {
    const me = await base44.auth.me();
    if (me && me.id) {
      const up = await base44.entities.UserCreativeProfile.filter(
        { created_by_id: me.id },
        "-updated_date",
        1
      );
      if (up && up[0]) {
        const p = up[0];
        const lines = ["## PRÉFÉRENCES CRÉATIVES DE L'UTILISATEUR"];
        if (p.preferred_styles && p.preferred_styles.length)
          lines.push(`Styles privilégiés: ${p.preferred_styles.join(", ")}`);
        if (p.preferred_languages && p.preferred_languages.length)
          lines.push(`Langues: ${p.preferred_languages.join(", ")}`);
        if (p.preferred_formats && p.preferred_formats.length)
          lines.push(`Formats: ${p.preferred_formats.join(", ")}`);
        if (p.recurring_corrections && p.recurring_corrections.length)
          lines.push(`Corrections fréquentes (évite de reproduire): ${p.recurring_corrections.join("; ")}`);
        if (p.preferences_summary) lines.push(`Profil créatif: ${p.preferences_summary}`);
        if (p.avg_rating) lines.push(`Satisfaction moyenne: ${Number(p.avg_rating).toFixed(1)}/5`);
        sections.push(lines.join("\n"));
      }
    }
  } catch (e) {
    /* non-blocking */
  }

  // --- Known failure patterns (global, admin-curated) ---
  try {
    const fp = await base44.entities.FailurePattern.filter(
      { active: true },
      "display_order",
      8
    );
    if (fp && fp.length) {
      const lines = ["## ERREURS CONNUES À ÉVITER"];
      fp.forEach(f => {
        const tag = f.error_type || f.category || "";
        lines.push(`- ${tag ? `[${tag}] ` : ""}${f.lesson}`);
      });
      sections.push(lines.join("\n"));
    }
  } catch (e) {
    /* non-blocking */
  }

  if (sections.length === 0) return "";

  return [
    "[CONTEXTE MÉMOIRE STORY221 — utilise ces informations pour garantir la cohérence et la qualité. N'utilise jamais ces informations pour trahir l'intention explicite de l'utilisateur.]",
    ...sections,
  ].join("\n");
}

/**
 * Prepend the memory context to the user's prompt.
 */
export function enrichPromptWithMemory(prompt, memoryContext) {
  if (!memoryContext || !prompt) return prompt;
  return `${memoryContext}\n\n---\n\nDemande utilisateur:\n${prompt}`;
}

/**
 * Record a per-generation satisfaction rating + optional improvement tags.
 */
export async function recordSatisfaction({ generationId, rating, improvementTags = [], comment = "" }) {
  if (!generationId || !rating) return null;
  return base44.entities.GenerationSatisfaction.create({
    generation_id: generationId,
    rating,
    improvement_tags: improvementTags,
    comment: comment.trim(),
  });
}

/**
 * Record a correction the user requested, with the reason category.
 */
export async function recordCorrection({ generationId, reason, detail = "", fromState = "", toState = "" }) {
  if (!generationId || !reason) return null;
  return base44.entities.CorrectionRecord.create({
    generation_id: generationId,
    reason,
    detail: detail.trim(),
    from_state: fromState,
    to_state: toState,
  });
}

/**
 * Create or update the project memory block for a given key.
 */
export async function upsertProjectMemory(projectKey, patch) {
  if (!projectKey) return null;
  const existing = await base44.entities.ProjectMemory.filter(
    { project_key: projectKey },
    "-updated_date",
    1
  );
  if (existing && existing[0]) {
    return base44.entities.ProjectMemory.update(existing[0].id, patch);
  }
  return base44.entities.ProjectMemory.create({ project_key: projectKey, ...patch });
}