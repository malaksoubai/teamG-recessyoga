import { sendSMS } from "@/lib/twilio";
import { sendEmail } from "@/lib/resend";

export type Instructor = {
  name: string;
  phone?: string;
  email: string;
  prefers: "sms" | "email";
  qualifiedClasses: string[];
};

export async function notifyInstructors(
  instructors: Instructor[],
  yogaType: string,
  message: string,
  fallback: boolean
) {
  const targets = fallback
    ? instructors
    : instructors.filter(i => i.qualifiedClasses.includes(yogaType));

  for (const instructor of targets) {
    if (instructor.prefers === "sms" && instructor.phone) {
      await sendSMS(instructor.phone, message);
    } else {
      await sendEmail(instructor.email, "Substitute Needed", message);
    }
  }
}