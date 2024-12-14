import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { IRequestBody, sendMail } from "https://deno.land/x/sendgrid@0.0.3/mod.ts";

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

  const { email } = await req.json()

  if (!email) {
    return new Response(JSON.stringify(
      { error: "Please provide an Email Address!"}
    ),
    { status: 400 });
  }

  const emailFormat: IRequestBody = {
    personalizations: [
      {
          subject: "Hello world",
          to: [{ email }],
      },
      ],
      from: { email: "kazdiniom21@gmail.com" },
      content: [
      { type: "text/plain", value: "Hello world" },
      { type: "text/html", value: "<h1>Hello world</h1>" },
      ],
  };

  try {
    const respond = await sendMail(emailFormat, { apiKey: SDGD_API_KEY });
    return new Response(JSON.stringify({ message: `Email has been sent to ${email}` }),
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
