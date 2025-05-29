import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
// import { betterFetch } from "better-fetch";
import type { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

export async function middleware(request: NextRequest) {
  console.log("➡️  request.nextUrl.origin =", request.nextUrl.origin);

  // const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://dealmaker.turoid.ai"; // production
  const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3004"; // development

  const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL, // explicitly provide the baseURL
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  if (!session) {
    // return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/activity-feed", "/blast-dashboard", "/web-controller"],
};
