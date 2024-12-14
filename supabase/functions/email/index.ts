import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { IRequestBody, sendMail, } from "https://deno.land/x/sendgrid@0.0.3/mod.ts";

const SENDGRID_API_KEY = Deno.env.get("SEND_GRID_KEY");

// check if the key exist in supabase
if (!SENDGRID_API_KEY) {
  throw new Error("Check if you have set the API Key properly");
  
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  const { email } = await req.json();

  if (!email) {
    return new Response(
      JSON.stringify({ error: "No email provided, please enter email" }),
      { status: 400 },
    );
  }

  const dataEmail: IRequestBody = {
    personalization: [
      {
        to: [{email}],
        subject: "Hello",
      },
    ],
    from: {email: "kazdiniom21@gmail.com"},
    content: [
      {
        type: "text/plain",
        value: "HELLLOOOO FIIINNALLLL!!!",
      },
    ],
  };

  try {
    const response = await sendMail(dataEmail, {apiKey: SENDGRID_API_KEY});
    return new Response(JSON.stringify({ message: "Email has been sent " }), {
      status: response.success ? 200 : 500,
    });
  } catch (e) {
    const errorMessage = e instanceof Error
      ? e.message
      : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }

})