import { NextRequest, NextResponse } from "next/server"
import { betterFetch } from "@better-fetch/fetch"
import type { auth } from "@/lib/auth"

type Session = typeof auth.$Infer.Session

export async function middleware(request: NextRequest) {
  // For debugging, let's log what Next sees as the origin:
  console.log("➡️  request.nextUrl.origin =", request.nextUrl.origin)

  // Force the fetch to go through your production domain (Option B)
  const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: "https://dealmaker.turoid.ai",
    headers: {
      cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
    },
  })

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard", "/activity-feed", "/blast-dashboard", "/web-controller"],
}
