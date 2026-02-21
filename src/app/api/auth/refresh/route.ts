import { NextRequest } from "next/server";
import { refreshTokens } from "@/services/authService";
import { successResponse, errorResponse } from "@/utils/response.util";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("refreshToken")?.value;
    if (!token) return errorResponse("No refresh token", "MISSING_TOKEN", 401);

    const tokens = await refreshTokens(token);
    const response = successResponse(tokens, "Tokens refreshed");
    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };
    response.cookies.set("accessToken", tokens.accessToken, { ...cookieOpts, maxAge: 60 * 15 });
    response.cookies.set("refreshToken", tokens.refreshToken, { ...cookieOpts, maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch {
    return errorResponse("Invalid refresh token", "INVALID_TOKEN", 401);
  }
}

export async function DELETE() {
  const response = successResponse(null, "Logged out");
  response.cookies.set("refreshToken", "", { httpOnly: true, maxAge: 0, path: "/" });
  return response;
}
