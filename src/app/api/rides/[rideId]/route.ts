import { NextRequest } from "next/server";
import { getRideById, acceptRide, updateRideStatus, cancelRide, completeRideAsRider } from "@/services/rideService";
import { verifyAccessToken, extractBearerToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from "@/utils/response.util";

export async function GET(req: NextRequest, { params }: { params: Promise<{ rideId: string }> }) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) return unauthorizedResponse();
    verifyAccessToken(token);

    const { rideId } = await params;
    const ride = await getRideById(rideId);
    if (!ride) return notFoundResponse("Ride not found");
    return successResponse(ride);
  } catch {
    return unauthorizedResponse();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ rideId: string }> }) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) return unauthorizedResponse();
    const payload = verifyAccessToken(token);

    const { rideId } = await params;
    const body = await req.json();
    const { action } = body;

    if (action === "accept" && payload.role === "CAPTAIN") {
      const ride = await acceptRide(rideId, payload.id);
      return successResponse(ride, "Ride accepted");
    }

    if (["CAPTAIN_ARRIVED", "IN_PROGRESS", "COMPLETED"].includes(action) && payload.role === "CAPTAIN") {
      const ride = await updateRideStatus(rideId, payload.id, action);
      return successResponse(ride, `Ride status updated to ${action}`);
    }

    if (action === "cancel" && payload.role === "RIDER") {
      const ride = await cancelRide(rideId, payload.id);
      return successResponse(ride, "Ride cancelled");
    }

    if (action === "complete" && payload.role === "RIDER") {
      const ride = await completeRideAsRider(rideId, payload.id);
      return successResponse(ride, "Ride completed");
    }

    return errorResponse("Invalid action", "INVALID_ACTION");
  } catch (error) {
    if (error instanceof Error) return errorResponse(error.message);
    return errorResponse("Failed to update ride", "SERVER_ERROR", 500);
  }
}
