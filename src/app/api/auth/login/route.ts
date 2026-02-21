import { NextRequest } from "next/server";
import { z } from "zod";
import { loginUser, loginCaptain } from "@/services/authService";
import { successResponse, errorResponse } from "@/utils/response.util";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["RIDER", "CAPTAIN"]).optional().default("RIDER"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role } = schema.parse(body);

    const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };

    if (role === "CAPTAIN") {
      const result = await loginCaptain({ email, password });
      const response = successResponse(result, "Login successful");
      response.cookies.set("refreshToken", result.tokens.refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });
      response.cookies.set("accessToken", result.tokens.accessToken, { ...cookieOpts, maxAge: 60 * 15 });
      return response;
    } else {
      const result = await loginUser({ email, password });
      const response = successResponse(result, "Login successful");
      response.cookies.set("refreshToken", result.tokens.refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });
      response.cookies.set("accessToken", result.tokens.accessToken, { ...cookieOpts, maxAge: 60 * 15 });
      return response;
    }
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("Validation failed", "VALIDATION_ERROR");
    if (error instanceof Error) return errorResponse(error.message, "AUTH_ERROR", 401);
    return errorResponse("Login failed", "SERVER_ERROR", 500);
  }
}
