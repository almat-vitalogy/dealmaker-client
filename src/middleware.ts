import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
// import { betterFetch } from "better-fetch";
import type { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  // For debugging, let's log what Next sees as the origin:
  console.log("➡️  request.nextUrl.origin =", request.nextUrl.origin)

  // Force the fetch to go through your production domain (Option B)
  const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/activity-feed", "/blast-dashboard", "/web-controller"],
};
