import Stripe from "https://esm.sh/stripe@16.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });


const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
if (!stripeKey) {
  return new Response(JSON.stringify({ error: "Missing STRIPE_SECRET_KEY in Edge Function secrets" }), {
    status: 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}


Deno.serve(async (req) => {
  // ✅ Preflight (must not throw)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") || "";

    // If the browser ever POSTs without a body, don't crash
    const raw = await req.text();
    let body: any = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = {};
    }

    const familyId = body.familyId;
    const amountCents = body.amountCents;

    if (!familyId || !amountCents || Number(amountCents) <= 0) {
      return new Response(JSON.stringify({ error: "Missing/invalid familyId or amountCents" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Confirm membership in that family (prevents paying other families)
    const { data: memberRow, error: memberErr } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", userData.user.id)
      .eq("family_id", familyId)
      .maybeSingle();

    if (memberErr || !memberRow) {
      return new Response(JSON.stringify({ error: "Not authorized for this family" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Tuition Payment" },
            unit_amount: Number(amountCents),
          },
          quantity: 1,
        },
      ],
      metadata: { familyId },
      success_url: `${siteUrl}/portal?paid=1`,
      cancel_url: `${siteUrl}/portal?canceled=1`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout-session error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
