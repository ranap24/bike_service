import { NextResponse } from "next/server";
import { ApiResponse } from "../types/index.types";

export function successResponse<T>(data: T, message?: string, status = 200) {
  const body: ApiResponse<T> = { success: true, data, message };
  return NextResponse.json(body, { status });
}

export function errorResponse(message: string, code?: string, status = 400) {
  const body: ApiResponse = { success: false, message, code };
  return NextResponse.json(body, { status });
}

export function unauthorizedResponse(message = "Unauthorized") {
  return errorResponse(message, "UNAUTHORIZED", 401);
}

export function forbiddenResponse(message = "Forbidden") {
  return errorResponse(message, "FORBIDDEN", 403);
}

export function notFoundResponse(message = "Not found") {
  return errorResponse(message, "NOT_FOUND", 404);
}

export function serverErrorResponse(message = "Internal server error") {
  return errorResponse(message, "SERVER_ERROR", 500);
}
