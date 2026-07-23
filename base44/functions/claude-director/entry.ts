// Claude Director - Thin wrapper that calls the shared creative-director module

import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { runCreativeDirection } from "../../shared/creative-director.ts";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await req.json();
    const result = await runCreativeDirection(payload);

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});