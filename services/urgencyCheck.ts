import { subRequests } from "@/data/subRequests";
import { instructors } from "@/data/instructors";
import { notifyInstructors } from "./notifications";

export async function runUrgencyCheck() {
  const now = new Date();

  for (const request of subRequests) {
    const classTime = new Date(request.classTime);

    const hoursLeft =
      (classTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    const shouldTriggerUrgency =
      !request.claimed && hoursLeft <= 48 && hoursLeft > 0;

    if (shouldTriggerUrgency) {
      await notifyInstructors(
        instructors,
        request.yogaType,
        `URGENT: Unclaimed sub within 48 hours for ${request.yogaType}`,
        true
      );
    }
  }
}