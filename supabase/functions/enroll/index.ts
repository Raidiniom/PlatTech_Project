import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.2";
import { IRequestBody, sendMail } from "https://deno.land/x/sendgrid@0.0.3/mod.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_ANON_KEY") ?? ""
);

const SDGD_API_KEY = Deno.env.get("SENDGRID_KEY");

if (!SDGD_API_KEY) {
  throw new Error("This key does not exist!!!");
  
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    })
  }

  const { email, name, course } = await req.json()

  if (!email) {
    return new Response(JSON.stringify(
      { error: "Please provide an Email Address!"}
    ),
    { status: 400 });
  }

  const emailFormat: IRequestBody = {
    personalizations: [
      {
          subject: `Enrollment to the course ${course}`,
          to: [{ email }],
      },
      ],
      from: { email: "kazdiniom21@gmail.com" },
      content: [
      { type: "text/html", value: `
        <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 50px;
      background-color: #f9f9f9;
    }
    h1 {
      color: #4CAF50;
    }
    p {
      font-size: 1.2em;
      color: #555;
    }
  </style>
</head>
<body>
  <h1>Welcome, ${name}!</h1>
  <p>We're excited to have you on ${course}. Let's achieve great things together!</p>
</body>
</html>
        
        ` },
      ],
  };

  try {
    const { data: studInfo, error: studError } = await supabase
    .from("student")
    .select("student_id")
    .eq("name", name)
    .single()

    if (!studInfo || studError) {
      return new Response(JSON.stringify(studError || { error: "Student does not exist!" }),);
    }

    const studID = studInfo.student_id;

    const { data: courInfo, error: courError } = await supabase
    .from("course")
    .select("course_id")
    .eq("course_name", course)
    .single()

    if (!courInfo || courError) {
      return new Response(JSON.stringify(courError || { error: "Course does not exist!" }),);
    }

    const courID = courInfo.course_id;

    const {data: enrollStat, error: enrollError } = await supabase
    .from("enrollment")
    .insert({
      student_id: studID,
      enrolled_data: NOW(),
      enrollment_statis: 0,
      course_id: courID,
    })

    if (enrollError) {
      return new Response(JSON.stringify(enrollError));
    }

      const respond = await sendMail(emailFormat, { apiKey: SDGD_API_KEY });
      return new Response(JSON.stringify({ message: `You have been enrolled to ${course}, please check your Email` }),
      { status: respond.success ? 200 : 500, });
    } catch (e) {
      const errorMessage = e instanceof Error
        ? e.message
        : "An unknown error occurred";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
      });
    }
})