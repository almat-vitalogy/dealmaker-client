import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession, forgetPassword, resetPassword } = createAuthClient({
  /** the base url of the server (optional if you're using the same domain) */
  baseURL: process.env.BETTER_AUTH_URL,
});
