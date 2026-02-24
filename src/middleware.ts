import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "mlm-secret-key-change-in-production"
);

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/reset-password") || pathname.startsWith("/api/auth") || pathname === "/api/packages" || pathname === "/api/register" || pathname.startsWith("/api/register/");
  if (isPublic) {
    if (pathname === "/" || pathname.startsWith("/api/")) {
      return NextResponse.next();
    }
    const token = request.cookies.get("auth-token")?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        const base = pathname.startsWith("/admin") ? "/admin" : pathname.startsWith("/franchise") ? "/franchise" : "/dashboard";
        return NextResponse.redirect(new URL(base, request.url));
      } catch {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = (payload as { role?: string }).role;

    if (pathname.startsWith("/admin")) {
      if (role !== "SUPER_ADMIN" && role !== "SUB_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } else if (pathname.startsWith("/franchise")) {
      if (role !== "FRANCHISE") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } else if (pathname.startsWith("/dashboard")) {
      if (role === "SUPER_ADMIN" || role === "SUB_ADMIN" || role === "FRANCHISE") {
        return NextResponse.redirect(new URL(role === "FRANCHISE" ? "/franchise" : "/admin", request.url));
      }
    }
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete("auth-token");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api/auth/login|favicon.ico).*)"],
};
