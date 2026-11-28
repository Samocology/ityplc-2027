

import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase service role configuration");
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// ------------------------------------------------------------------
// Main handler
// ------------------------------------------------------------------

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type",
      },
    });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse({ error: "Service misconfigured" }, 500);
  }

  // Read request body
  let body: { zone_id_code?: string };
  try {
    body = (await req.json()) as { zone_id_code?: string };
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const { zone_id_code } = body;

  if (!zone_id_code || typeof zone_id_code !== "string") {
    return jsonResponse({ error: "Zone ID code is required" }, 400);
  }

  // Initialize Supabase admin client
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // Look up the zone by Zone ID code
  const { data: zone, error: zoneError } = await supabaseAdmin
    .from("zones")
    .select("id, name, zone_id_code, is_activated, admin_email, activated_at")
    .eq("zone_id_code", zone_id_code.trim())
    .single();

  if (zoneError || !zone) {
    return jsonResponse({ exists: false }, 404);
  }

  // Check for pending activation code (not yet activated)
  let hasPendingActivation = false;
  let activationEmail: string | null = null;

  if (!zone.is_activated) {
    const { data: activationCode } = await supabaseAdmin
      .from("zone_activation_codes")
      .select("email, expires_at, used_at")
      .eq("zone_id", zone.id)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (activationCode) {
      hasPendingActivation = true;
      activationEmail = activationCode.email ?? null;
    }
  }

  // Determine the email to display for login/activation
  const email = zone.admin_email || activationEmail || null;

  return jsonResponse({
    exists: true,
    zoneId: zone.id,
    zoneName: zone.name,
    zoneIdCode: zone.zone_id_code,
    activated: zone.is_activated,
    activatedAt: zone.activated_at,
    email,
    hasPendingActivation,
  });
});
