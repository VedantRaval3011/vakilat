import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { protectedPrefixes } from "@/lib/navigation";

const AUTH_PAGES = ["/sign-in", "/sign-up", "/forgot-password"];

async function isSignedIn(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

const isProtected = (pathname: string) =>
  protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const signedIn = await isSignedIn(req);

  if (isProtected(pathname) && !signedIn) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (AUTH_PAGES.includes(pathname) && signedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Must stay a static literal; keep in sync with `protectedPrefixes`.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/case-law/:path*",
    "/bare-acts/:path*",
    "/code-converter/:path*",
    "/constitution/:path*",
    "/glossary/:path*",
    "/vidhi/:path*",
    "/draft-studio/:path*",
    "/moot-practice/:path*",
    "/translate/:path*",
    "/history/:path*",
    "/notes/:path*",
    "/saved/:path*",
    "/hearings/:path*",
    "/settings/:path*",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
  ],
};
