import { NextResponse } from "next/server";
import { getOpenSubstituteRequests } from "@/lib/substitute-requests";

export async function GET() {
  try {
    const requests = await getOpenSubstituteRequests();
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Failed to fetch substitute requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch substitute requests" },
      { status: 500 },
    );
  }
}
