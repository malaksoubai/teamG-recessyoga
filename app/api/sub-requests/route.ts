import { instructors } from "@/data/instructors";
import { notifyInstructors } from "@/services/notifications";
import { subRequests } from "@/data/subRequests";

export async function POST(req: Request) {
  const { yogaType, classTime } = await req.json();

  const newRequest = {
    id: crypto.randomUUID(),
    yogaType,
    classTime,
    claimed: false,
  };

  subRequests.push(newRequest);

  await notifyInstructors(
    instructors,
    yogaType,
    `Substitute needed for ${yogaType} at ${classTime}`,
    false // only qualified instructors
  );

  return Response.json({ success: true, request: newRequest });
}