import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // Use the service role key for admin operations
);

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, message: "Method not allowed!" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "Email, password are required!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sign up the user
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
    
      if (error) {
        console.error("Error creating user:", error);
        return new Response(
          JSON.stringify({ success: false, message: error.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    
      return new Response(
        JSON.stringify({ success: true, message: "User signed up successfully!", data }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      console.error("Unexpected error:", err);
      return new Response(
        JSON.stringify({ success: false, message: err.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
