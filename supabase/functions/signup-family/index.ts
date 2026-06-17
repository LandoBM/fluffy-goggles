import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const { email, password, familyName, parentName, phone, students } = await req.json();

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // 1. Create auth user
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authErr) throw authErr;

    const userId = authData.user.id;

    // 2. Create family
    const { data: family, error: famErr } = await supabaseAdmin
      .from("families")
      .insert({ name: familyName, status: "pending", parent_name: parentName, phone: phone || null })
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
      const { error: studErr } = await supabaseAdmin.from("students").insert(studentRows);
      if (studErr) throw studErr;
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});
