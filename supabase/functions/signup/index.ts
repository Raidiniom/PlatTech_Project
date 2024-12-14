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
    const { email, password, name} = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "Email, password are required!" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sign up the user
    const { data: userData, error: errorData } = await supabase.auth.signUp({
      email,
      password,
    });
  
    // failed signup response
    if (errorData) {
      console.error("Error creating user:", errorData);
      return new Response(
        JSON.stringify({ success: false, message: errorData.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Ensure user metadata has a role
    const role = userData?.user?.user_metadata?.role;
    
    if (role === 'Student') {
      const { data: studData, error: studError } = await supabase
      .from("student")
      .insert({
        student_id: userData?.user?.id,
        name: name,
        email_address: userData?.user?.email,
      })

      // Check if inserting into the student table was successful
      if (studError) {
        console.error("Error inserting into faculty table:", studError);
        return new Response(
          JSON.stringify({ success: false, message: studError.message }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

    } else {
      const { data: authUser, error: authError } = await supabase
        .from("faculty")
        .insert({
          faculty_id: userData?.user?.id,
          role: role,
          email_address: userData?.user?.email,
        });
      
        // Check if inserting into the faculty table was successful
        if (authError) {
          console.error("Error inserting into faculty table:", authError);
          return new Response(
            JSON.stringify({ success: false, message: authError.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
    }


    // successful signup response
    return new Response(
      JSON.stringify(
        { success: true, message: "User signed up successfully!", user: userData },
        { status: 201, headers: { "Content-Type": "application/json" } }
      )
    ); 
    
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
