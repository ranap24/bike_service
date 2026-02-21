import { NextRequest } from "next/server";
import { z } from "zod";
import { createRide, getUserRideHistory, getAvailableRides } from "@/services/rideService";
import { getFareEstimate } from "@/services/fareService";
import { verifyAccessToken, extractBearerToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/utils/response.util";

const createRideSchema = z.object({
  pickupAddress: z.string().min(3),
  pickupLatitude: z.number(),
  pickupLongitude: z.number(),
  dropAddress: z.string().min(3),
  dropLatitude: z.number(),
  dropLongitude: z.number(),
  vehicleType: z.enum(["BIKE", "AUTO", "CAR"]),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  // Fare estimate is a pure calculation — no auth required
  if (type === "fare") {
    try {
      const pLat = parseFloat(searchParams.get("pickupLat") || "0");
      const pLon = parseFloat(searchParams.get("pickupLon") || "0");
      const dLat = parseFloat(searchParams.get("dropLat") || "0");
      const dLon = parseFloat(searchParams.get("dropLon") || "0");
      const estimate = getFareEstimate(pLat, pLon, dLat, dLon);
      return successResponse(estimate);
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : "Failed to calculate fare", "SERVER_ERROR", 500);
    }
  }

  // All other GET requests require authentication
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) return unauthorizedResponse();
    const payload = verifyAccessToken(token);

    if (type === "available" && payload.role === "CAPTAIN") {
      const rides = await getAvailableRides();
      return successResponse(rides);
    }

    const page = parseInt(searchParams.get("page") || "1");
    const history = await getUserRideHistory(payload.id, page);
    return successResponse(history);
  } catch (error) {
    if (error instanceof Error && (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError")) {
      return unauthorizedResponse();
    }
    return errorResponse(error instanceof Error ? error.message : "Server error", "SERVER_ERROR", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get("authorization"));
    if (!token) return unauthorizedResponse();
    const payload = verifyAccessToken(token);

    if (payload.role !== "RIDER") return errorResponse("Only riders can book rides", "FORBIDDEN", 403);

    const body = await req.json();
    const input = createRideSchema.parse(body);
    const ride = await createRide(payload.id, input);
    return successResponse(ride, "Ride created", 201);
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("Validation failed", "VALIDATION_ERROR");
    if (error instanceof Error) return errorResponse(error.message);
    return errorResponse("Failed to create ride", "SERVER_ERROR", 500);
  }
}
