import { NextResponse } from "next/server";
import { Resend } from "resend";

const CONTACT_EMAIL = "shortnaas@proton.me";

// Mirrors the form's maxLength values: the browser constraint is a convenience,
// these are the ones that hold.
const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_MESSAGE = 5000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, message, captcha } = body;

    const captchaAnswer = (captcha ?? "").toString().trim().toLowerCase();
    if (captchaAnswer !== "naas") {
      return NextResponse.json(
        { message: "Captcha answer is incorrect. The site name is shown above." },
        { status: 400 }
      );
    }

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json(
        { message: "Full name is required." },
        { status: 400 }
      );
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }
    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { message: "Message is required." },
        { status: 400 }
      );
    }

    if (fullName.trim().length > MAX_NAME) {
      return NextResponse.json(
        { message: `Name is too long (max ${MAX_NAME} characters).` },
        { status: 400 }
      );
    }
    if (email.trim().length > MAX_EMAIL) {
      return NextResponse.json(
        { message: `Email is too long (max ${MAX_EMAIL} characters).` },
        { status: 400 }
      );
    }
    if (message.trim().length > MAX_MESSAGE) {
      return NextResponse.json(
        { message: `Message is too long (max ${MAX_MESSAGE} characters).` },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Naas <contact@naas.work>";

    if (!apiKey) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { message: "Contact form is not configured. Please try again later." },
        { status: 503 }
      );
    }

    const resend = new Resend(apiKey);

    // Newlines in a name would otherwise land in the mail subject header.
    const safeName = fullName.trim().replace(/[\r\n]+/g, " ");

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: CONTACT_EMAIL,
      replyTo: email.trim(),
      subject: `Contact from ${safeName}`,
      text: `From: ${fullName.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { message: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Contact API error:", e);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
