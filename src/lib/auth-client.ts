import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession, forgetPassword, resetPassword } = createAuthClient({
  /** the base url of the server (optional if you're using the same domain) */
  // baseURL: "https://dealmaker-eight.vercel.app",
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://dealmaker.turoid.ai",
});
