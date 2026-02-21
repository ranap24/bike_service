import { NextRequest } from "next/server";
import { z } from "zod";
import { registerUser, registerCaptain } from "@/services/authService";
import { successResponse, errorResponse } from "@/utils/response.util";

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.literal("RIDER").optional().default("RIDER"),
});

const captainSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  role: z.literal("CAPTAIN"),
  vehicleType: z.enum(["BIKE", "AUTO", "CAR"]),
  vehiclePlate: z.string().min(4),
  vehicleModel: z.string().min(2),
  vehicleColor: z.string().min(2),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.role === "CAPTAIN") {
      const input = captainSchema.parse(body);
      const captain = await registerCaptain(input);
      return successResponse(captain, "Captain registered successfully", 201);
    } else {
      const input = userSchema.parse(body);
      const user = await registerUser(input);
      return successResponse(user, "User registered successfully", 201);
    }
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse(error.issues[0]?.message || "Validation failed", "VALIDATION_ERROR");
    if (error instanceof Error) return errorResponse(error.message, "REGISTER_ERROR");
    return errorResponse("Registration failed", "SERVER_ERROR", 500);
  }
}
