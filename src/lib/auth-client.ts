import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession, forgetPassword, resetPassword } = createAuthClient({
  // baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://dealmaker.turoid.ai", // production
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3004", // development
});
