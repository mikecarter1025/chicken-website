import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";

const ADMIN_EMAIL = "ali.jasser@aol.com";
const ADMIN_PASSWORD = "ChickenAdmin2024!";

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

      if (input.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && input.password === ADMIN_PASSWORD) {
        attempts[key] = 0;
        return { success: true, email: ADMIN_EMAIL, remaining: 3 };
      } else {
        attempts[key] = currentAttempts + 1;
        const remaining = Math.max(0, 3 - attempts[key]);
        return { success: false, error: `Invalid credentials. ${remaining} attempts remaining.`, remaining };
      }
    }),

  check: publicQuery.query(async () => {
    // This is a placeholder - actual auth state is managed client-side
    return { isLoggedIn: false };
  }),
});
