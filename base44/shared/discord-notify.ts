// Discord Notify - Envoie une alerte sur le canal Discord via webhook entrant
// Utilisé pour alerter l'admin en cas d'échec de génération vidéo en production

export async function sendDiscordAlert({ title, message, fields }) {
  const webhookUrl = Deno.env.get("DISCORD_WEBHOOK_URL");
  if (!webhookUrl) return; // Webhook non configuré — ignore silencieusement

  const payload = {
    username: "Story221 Alerts",
    embeds: [
      {
        title: `🚨 ${title}`,
        description: message,
        color: 0xff0033,
        fields: (fields || []).map(f => ({ name: f.name, value: f.value, inline: !!f.inline })),
        timestamp: new Date().toISOString(),
        footer: { text: "Story221 Monitoring" },
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`Discord webhook failed: ${res.status} ${res.statusText}`);
    }
  } catch (e) {
    console.error("Discord notify error:", e.message);
  }
}