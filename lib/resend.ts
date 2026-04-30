import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail(to: string, subject: string, content: string) {
  return resend.emails.send({
    from: "Recess Yoga Studio <noreply@zilawhaeku.resend.app>",
    to,
    subject,
    html: `<p>${content}</p>`,
  });
}