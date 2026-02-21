import { NextRequest, NextResponse } from "next/server";

// Edge-compatible JWT payload decoder (no signature verification — full verify happens in API routes)
function decodeJwtPayload(token: string): { role?: string; exp?: number } | null {
  try {
    const [, b64] = token.split(".");
    const json = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json);
    if (payload.exp && payload.exp * 1000 < Date.now()) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

const PROTECTED: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/rider", roles: ["RIDER", "ADMIN"] },
  { prefix: "/captain", roles: ["CAPTAIN", "ADMIN"] },
  { prefix: "/admin", roles: ["ADMIN"] },
];

const ROLE_HOME: Record<string, string> = {
  RIDER: "/rider/book",
  CAPTAIN: "/captain/dashboard",
  ADMIN: "/admin/dashboard",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;
  const payload = accessToken ? decodeJwtPayload(accessToken) : null;
  const role = payload?.role;

  // Redirect already-logged-in users away from /login and /register
  if (pathname === "/login" || pathname === "/register") {
    if (role && ROLE_HOME[role]) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
    }
    return NextResponse.next();
  }

  const matched = PROTECTED.find((p) => pathname.startsWith(p.prefix));
  if (!matched) return NextResponse.next();

  // Not logged in
  if (!role) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Wrong role
  if (!matched.roles.includes(role)) {
    const dest = ROLE_HOME[role] ?? "/";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/rider/:path*", "/captain/:path*", "/admin/:path*", "/login", "/register"],
};

