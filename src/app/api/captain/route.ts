import { NextRequest } from "next/server";
import { getCaptainProfile, updateCaptainLocation, toggleCaptainOnlineStatus } from "@/services/captainService";
import { getCaptainRideHistory } from "@/services/rideService";
import { verifyAccessToken, extractBearerToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/utils/response.util";

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) return unauthorizedResponse();
    const payload = verifyAccessToken(token);
    if (payload.role !== "CAPTAIN") return errorResponse("Forbidden", "FORBIDDEN", 403);

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "history") {
      const page = parseInt(searchParams.get("page") || "1");
      const history = await getCaptainRideHistory(payload.id, page);
      return successResponse(history);
    }

    const profile = await getCaptainProfile(payload.id);
    return successResponse(profile);
  } catch {
    return unauthorizedResponse();
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) return unauthorizedResponse();
    const payload = verifyAccessToken(token);
    if (payload.role !== "CAPTAIN") return errorResponse("Forbidden", "FORBIDDEN", 403);

    const body = await req.json();

    if (body.action === "location") {
      await updateCaptainLocation(payload.id, body.lat, body.lng);
      return successResponse(null, "Location updated");
    }

    if (body.action === "toggle_online") {
      const captain = await toggleCaptainOnlineStatus(payload.id, body.isOnline);
      return successResponse(captain, "Status updated");
    }

    return errorResponse("Invalid action", "INVALID_ACTION");
  } catch (error) {
    if (error instanceof Error) return errorResponse(error.message);
    return errorResponse("Update failed", "SERVER_ERROR", 500);
  }
}
