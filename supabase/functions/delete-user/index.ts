// Supabase Edge Function: delete-user
// Deploy with: supabase functions deploy delete-user
// Then call from client: supabase.functions.invoke("delete-user")
//
// Requires env vars in Supabase project (Functions):
//   SUPABASE_URL
//   SUPABASE_ANON_KEY
//   SUPABASE_SERVICE_ROLE_KEY
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing environment variables" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const authHeader =
    req.headers.get("authorization") ?? req.headers.get("Authorization") ?? "";

  // 1) Verify caller identity (anon key + JWT)
  const supabaseAuth = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
  if (userErr || !userData?.user) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        hasAuthHeader: Boolean(authHeader),
        authHeaderPrefix: authHeader.slice(0, 12), // should start with "Bearer "
        supabaseError: userErr?.message ?? null,
      }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
  
  const userId = userData.user.id;

  // 2) Admin delete (service role)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Best-effort cleanup
  const { error: profileErr } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", userId);

  const { error: deleteErr } =
    await supabaseAdmin.auth.admin.deleteUser(userId);

  if (deleteErr) {
    return new Response(
      JSON.stringify({
        error: deleteErr.message,
        details: { profileDeleted: !profileErr },
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return new Response(
    JSON.stringify({ ok: true, profileDeleted: !profileErr }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
