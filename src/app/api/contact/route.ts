import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { smtpConfig } from "@/lib/smtp";

// Where contact-form mail is delivered. The sender has to stay on the naas.work
// domain the mail host is authorised to send for (see README).
const CONTACT_EMAIL = "yo@naas.work";
const CONTACT_FROM = process.env.CONTACT_FROM ?? "Naas <yo@naas.work>";

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

    const config = smtpConfig(process.env);
    if (!config) {
      console.error("SMTP_HOST / SMTP_USER / SMTP_PASSWORD are not set");
      return NextResponse.json(
        { message: "Contact form is not configured. Please try again later." },
        { status: 503 }
      );
    }

    // Timeouts stay under the platform's function limit, so an unreachable mail
    // host fails cleanly instead of hanging until the request is killed.
    const transport = nodemailer.createTransport({
      ...config,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 8000,
    });

    // Newlines in a name would otherwise land in the mail subject header.
    const safeName = fullName.trim().replace(/[\r\n]+/g, " ");

    // nodemailer throws on failure, unlike the API this replaced.
    try {
      await transport.sendMail({
        from: CONTACT_FROM,
        to: CONTACT_EMAIL,
        replyTo: email.trim(),
        subject: `Contact from ${safeName}`,
        text: `From: ${fullName.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
      });
    } catch (error) {
      console.error("SMTP send failed:", error);
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
