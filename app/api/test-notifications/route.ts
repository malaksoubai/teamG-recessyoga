import { NextResponse } from "next/server"
import { Resend } from "resend"
import twilio from "twilio"

export async function GET() {
  const results: Record<string, string> = {}

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    results.resend = "❌ skipped: RESEND_API_KEY not set"
  } else {
    const resend = new Resend(resendKey)
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
  }

  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) {
    results.twilio = "❌ skipped: Twilio env not set"
  } else {
    const twilioClient = twilio(sid, token)
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
  }

  return NextResponse.json(results)
}
