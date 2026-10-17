import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MAX_SHORT = 255;
const MAX_MESSAGE = 5000;

type Field = "name" | "email" | "subject" | "message";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Receives the contact form and emails it to the site owner through Resend. */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const values: Record<Field, string> = {
    name: clean(body.name),
    email: clean(body.email).toLowerCase(),
    subject: clean(body.subject),
    message: clean(body.message),
  };

  const errors: Partial<Record<Field, string>> = {};
  if (!values.name) errors.name = "Field cannot be blank.";
  if (!values.subject) errors.subject = "Field cannot be blank.";
  if (!values.message) errors.message = "Field cannot be blank.";
  if (!EMAIL_REGEX.test(values.email)) errors.email = "Invalid email address format.";
  if (values.name.length > MAX_SHORT) errors.name = "Too long.";
  if (values.subject.length > MAX_SHORT) errors.subject = "Too long.";
  if (values.message.length > MAX_MESSAGE) errors.message = "Message is too long.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.error("Contact form: RESEND_API_KEY or CONTACT_TO_EMAIL is not set.");
    return NextResponse.json({ error: "Contact form is not configured." }, { status: 500 });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: values.email,
      subject: `[Portfolio] ${values.subject}`,
      text: `From: ${values.name} <${values.email}>\n\n${values.message}`,
      html: `<p><strong>${escapeHtml(values.name)}</strong> &lt;${escapeHtml(values.email)}&gt;</p><p>${escapeHtml(values.message).replace(/\n/g, "<br>")}</p>`,
    }),
    signal: AbortSignal.timeout(10000),
  }).catch(() => null);

  if (!response || !response.ok) {
    console.error("Contact form: Resend failed", response?.status);
    return NextResponse.json({ error: "Could not send message." }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
