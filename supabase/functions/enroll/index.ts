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
      return new Response(
        JSON.stringify({
          isSuccess: false,
          message: "You are not authorized to create enrollments!",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.split(" ")[1];

    const { data: user, error } = await supabase.auth.getUser(token);

    // If the token is wrong or not the right kind of token
    if (error) {
      return new Response(
        JSON.stringify({ isSuccess: false, message: "Invalid Token!" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // If the user that is being fetched does not exist
    if (!user) {
      return new Response(
        JSON.stringify({ isSuccess: false, message: "User does not exist!" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Now doing the creation of enrollment adding a row in the enrollment table
    if (req.method === "POST") {
      const body = await req.json();

      let course_id = body.course_id;

      if (!course_id) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Please provide the course_id!",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Convert the string input into an integer for table insertion since the table requires an integer
      if (typeof course_id === "string") {
        const parsedCourseId = parseInt(course_id);
        if (isNaN(parsedCourseId)) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "Invalid course_id: must be an integer",
            }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        course_id = parsedCourseId;
      }

      // Insert enrollment into the database
      const { data, error: insertError } = await supabase
        .from("enrollments")
        .insert({
          course_id,
          user_id: user.id, // Use authenticated user's ID
        });

      if (insertError) {
        return new Response(
          JSON.stringify({ success: false, message: insertError.message }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify({ success: true, data }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: false, message: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
