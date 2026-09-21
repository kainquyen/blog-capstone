import { betterAuth, email } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "~/lib/db/client";
import { admin } from "better-auth/plugins"

import { sendDeleteAccountVerification, sendVerificationEmail, sendResetPassword, sendPasswordResetNotification } from "~/lib/auth/auth-email"

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), { provider: "pg" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  session: { expiresIn: 60 * 60 * 24 * 7 },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
    },
  },
  plugins: [
    admin()
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
        input: false,
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendDeleteAccountVerification({ user, url })
      },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendVerificationEmail({ user, url })
    },

    autoSignInAfterVerification: true,
    sendOnSignUp: true,
  },
  emailAndPassword: {
    requireEmailVerification: true,
    enabled: true,
    sendResetPassword: async ({ user, url }, request) => {
      await sendResetPassword({ user, url })
    },
    onPasswordReset: async ({ user }, request) => {
      const now = new Date();
      const time = now.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
      await sendPasswordResetNotification({ user, timestamp: time })
    },
  },
});
