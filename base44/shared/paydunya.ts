export const PAYDUNYA_API_BASE = Deno.env.get("PAYDUNYA_MODE") === "live"
  ? "https://app.paydunya.com/api/v1"
  : "https://app.paydunya.com/sandbox-api/v1";

export function getPaydunyaHeaders() {
  return {
    "PAYDUNYA-MASTER-KEY": Deno.env.get("PAYDUNYA_MASTER_KEY") || "",
    "PAYDUNYA-PRIVATE-KEY": Deno.env.get("PAYDUNYA_PRIVATE_KEY") || "",
    "PAYDUNYA-TOKEN": Deno.env.get("PAYDUNYA_TOKEN") || "",
    "Content-Type": "application/json",
  };
}

export function getIpnCallbackUrl() {
  const appId = Deno.env.get("BASE44_APP_ID");
  return `https://api.base44.com/v1/apps/${appId}/functions/paydunya-ipn`;
}

export function getAppOrigin(req) {
  const referer = req.headers.get("referer") || "";
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch { /* ignore */ }
  }
  const origin = req.headers.get("origin") || "";
  if (origin) return origin;
  return "https://story221.com";
}