import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { nextCookies } from "better-auth/next-js";
import { sendEmail } from "./email";

const client = new MongoClient("mongodb+srv://jasmine:xxbjyP0RMNrOf2eS@dealmaker.hbhznd5.mongodb.net/?retryWrites=true&w=majority&appName=dealmaker");
export const db = client.db("dealmaker");

// DEBUG LOGS FOR ENV VARIABLES
// console.log("🔍 GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID );
// console.log("🔍 GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    // disableSignUp: false,
    // requireEmailVerification: true,
    account: {
      accountLinking: {
        enabled: true,
      },
    },
    minPasswordLength: 4,
    // maxPasswordLength: 128,
    // autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      // Send reset password email

      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    // password: {
    //   hash: async (password) => {
    //     // Custom password hashing
    //     return hashedPassword;
    //   },
    //   verify: async ({ hash, password }) => {
    //     // Custom password verification
    //     return isValid;
    //   },
    // },
  },
  socialProviders: {
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID as string,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    // },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID  as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  plugins: [nextCookies()],
});
