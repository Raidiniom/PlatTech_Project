import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? ""
);

Deno.serve(async (req) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      throw new Error("Missing input credentials -> email or password");
    }

    const { data: authData, error: logInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (logInError) {
      return new Response(
        JSON.stringify({ error: logInError.message }),
        { status: 401 }
      );
    }

    return new Response(JSON.stringify(authData));
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : "error occurred";
    console.error("Error:", e);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500 }
    );
  }
});
