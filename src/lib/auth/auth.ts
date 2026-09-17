import { betterAuth, email } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "~/lib/db/client";
import {
  sendEmail
} from "~/lib/email";

import {sendDeleteAccountVerification, sendVerificationEmail} from "~/lib/auth/auth-email"

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
      await sendVerificationEmail({user, url})
    },

    autoSignInAfterVerification: true,
    sendOnSignUp: true,
  },
  emailAndPassword: {
    requireEmailVerification: true,
    enabled: true,
    sendResetPassword: async ({ user, url }, request) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Đặt lại mật khẩu</h2>
            <p>Xin chào ${user.name || "bạn"},</p>
            <p>Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu của bạn:</p>
            <a href="${url}" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Đặt lại Mật khẩu
            </a>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">Hoặc dán liên kết này vào trình duyệt: ${url}</p>
          </div>
        `,
      });
    },
  },
});
