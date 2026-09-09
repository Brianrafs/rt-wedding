import { NextResponse, type NextRequest } from "next/server";
import { adminSessionCookie } from "@/lib/session-cookie";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (request.cookies.has(adminSessionCookie)) return NextResponse.next();
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
