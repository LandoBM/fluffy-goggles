import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase env vars:", {
    REACT_APP_SUPABASE_URL: supabaseUrl,
    REACT_APP_SUPABASE_ANON_KEY: supabaseAnonKey ? "present" : "missing",
  });
  throw new Error("Supabase env vars missing. Check your .env and restart npm start.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
