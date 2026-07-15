import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";

const ADMIN_EMAIL = "ali.jasser@aol.com";
let adminPassword = "JSHM&R1@.g$Q3DZe";

// Simple in-memory rate limiting (resets on server restart)
const attempts: Record<string, number> = {};

export const adminRouter = createRouter({
  login: publicQuery
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      const key = input.email.toLowerCase();
      const currentAttempts = attempts[key] || 0;

      if (currentAttempts >= 3) {
        return { success: false, error: "Account locked. Too many failed attempts.", remaining: 0 };
      }

      if (input.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && input.password === adminPassword) {
        attempts[key] = 0;
        return { success: true, email: ADMIN_EMAIL, remaining: 3 };
      } else {
        attempts[key] = currentAttempts + 1;
        const remaining = Math.max(0, 3 - attempts[key]);
        return { success: false, error: `Invalid credentials. ${remaining} attempts remaining.`, remaining };
      }
    }),

  changePassword: publicQuery
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      if (input.currentPassword !== adminPassword) {
        return { success: false, error: "Current password is incorrect" };
      }
      adminPassword = input.newPassword;
      return { success: true };
    }),
});
