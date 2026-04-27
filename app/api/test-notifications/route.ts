import { NextResponse } from "next/server"
import { Resend } from "resend"
import twilio from "twilio"

const resend = new Resend(process.env.RESEND_API_KEY)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function GET() {
  const results: Record<string, string> = {}

  // Test Resend
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", // use this for testing, no domain needed
      to: "malaksoubai03@gmail.com", // ← put your email here
      subject: "Resend Test — Recess Yoga",
      html: "<p>Resend is working!</p>",
    })
    results.resend = "✅ success"
  } catch (err) {
    results.resend = `❌ failed: ${err}`
  }

  // PENDING:Test Twilio - test doesn't work if TFN not verified
  try {
    await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: "+16787943988", // ← put your real phone number here
      body: "Twilio is working! — Recess Yoga test",
    })
    results.twilio = "✅ success"
  } catch (err) {
    results.twilio = `❌ failed: ${err}`
  }

  return NextResponse.json(results)
}