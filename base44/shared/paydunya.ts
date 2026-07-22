export const PAYDUNYA_API_BASE = "https://app.paydunya.com/api/v1";

export function getPaydunyaHeaders() {
  return {
    "PAYDUNYA-MASTER-KEY": Deno.env.get("PAYDUNYA_MASTER_KEY") || "",
    "PAYDUNYA-PRIVATE-KEY": Deno.env.get("PAYDUNYA_PRIVATE_KEY") || "",
    "PAYDUNYA-TOKEN": Deno.env.get("PAYDUNYA_TOKEN") || "",
    "Content-Type": "application/json",
  };
}