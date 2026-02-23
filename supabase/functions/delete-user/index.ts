// supabase/functions/delete-user/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    }

    // Service role client (bypasses RLS)
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // User client (to validate who is calling using the user's JWT)
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } =
      await admin.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // 1) Read avatar path from profile (if any)
    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (profileErr) {
      // not fatal; continue deletion anyway
      console.error("Profile lookup error:", profileErr);
    }

    // 2) Delete avatar file(s) from storage
    // avatar_url stores a PATH like "<uid>/avatar.jpg"
    // We'll delete:
    // - the exact path if present
    // - plus any files under "<uid>/" to be safe
    const pathsToDelete: string[] = [];

    const avatarPath = (profile?.avatar_url ?? "").trim();
    if (avatarPath) pathsToDelete.push(avatarPath);

    // Also delete any leftover files under the user's folder (covers old unique filenames)
    // This requires listing first.
    const { data: listed, error: listErr } = await admin.storage
      .from("avatars")
      .list(userId, { limit: 100 });

    if (!listErr && Array.isArray(listed)) {
      for (const obj of listed) {
        if (obj?.name) pathsToDelete.push(`${userId}/${obj.name}`);
      }
    }

    // Deduplicate
    const uniquePaths = Array.from(new Set(pathsToDelete));

    if (uniquePaths.length > 0) {
      const { error: removeErr } = await admin.storage
        .from("avatars")
        .remove(uniquePaths);

      if (removeErr) {
        // not fatal; continue deleting account
        console.error("Avatar remove error:", removeErr);
      }
    }

    // 3) Delete profile row (optional if you have cascade triggers; safe to do)
    const { error: profDelErr } = await admin
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (profDelErr) {
      // not fatal; still attempt auth delete
      console.error("Profile delete error:", profDelErr);
    }

    // 4) Delete auth user (this is the important one)
    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) {
      throw delErr;
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error)?.message ?? "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
