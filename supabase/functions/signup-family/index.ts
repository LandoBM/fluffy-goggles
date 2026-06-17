import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { email, password, familyName, parentName, phone, students } =
    await req.json();

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // 1. Create auth user
    const { data: authData, error: authErr } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
    if (authErr) throw authErr;

    const userId = authData.user.id;

    // Create profile manually since trigger may not fire
    const { error: profileErr } = await supabaseAdmin
      .from("profiles")
      .insert({ id: userId, role: "parent" });

    // Ignore if already exists
    if (profileErr && !profileErr.message.includes("duplicate")) {
      throw profileErr;
    }

    // 2. Create family
    const { data: family, error: famErr } = await supabaseAdmin
      .from("families")
      .insert({
        name: familyName,
        status: "pending",
        parent_name: parentName,
        phone: phone || null,
      })
      .select()
      .single();
    if (famErr) throw famErr;

    // 3. Link user to family
    const { error: memberErr } = await supabaseAdmin
      .from("family_members")
      .insert({ user_id: userId, family_id: family.id });
    if (memberErr) throw memberErr;

    // 4. Insert students
    const studentRows = (students || [])
      .filter((s) => s.firstName && s.lastName)
      .map((s) => ({
        family_id: family.id,
        first_name: s.firstName,
        last_name: s.lastName,
        grade: s.grade || null,
      }));

    if (studentRows.length > 0) {
      const { error: studErr } = await supabaseAdmin
        .from("students")
        .insert(studentRows);
      if (studErr) throw studErr;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
