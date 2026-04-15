import { NextRequest } from "next/server";
import { getUserNotificationDetails } from "~/lib/kv";

export async function POST(request: NextRequest) {
  const requestJson = await request.json();
  const { address } = requestJson;

  if (!address) {
    return Response.json(
      { success: false, error: "Missing address" },
      { status: 400 }
    );
  }

  const notificationDetails = await getUserNotificationDetails(address);

  return Response.json({
    success: true,
    notificationDetails: notificationDetails || null,
  });
}
