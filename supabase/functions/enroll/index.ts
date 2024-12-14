import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? ""
);

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify(
        { isSuccess: false, message: "You are not authorized to create enrollments!" }), 
        { status: 401, headers: { "Content-Type": "application/json"},
      });
    }
    
    const token = authHeader.split(" ")[1];

    const {data: user, error} = await supabase.auth.getUser(token);

    // If the token is wrong or not the right kind of token
    if (error) {
      return new Response(JSON.stringify(
        { isSuccess: false, message: "Invalid Token!" }), 
        { status: 401, headers: { "Content-Type": "application/json"},
      });
    }

    // If the user that is being fetch does not exist
    if (!user) {
      return new Response(JSON.stringify(
        { isSuccess: false, message: "User does not exist!" }), 
        { status: 401, headers: { "Content-Type": "application/json"},
      });
    }

    if (req.method === "POST") {
      
    }

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
