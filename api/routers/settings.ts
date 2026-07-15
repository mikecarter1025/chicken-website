import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { siteSettings } from "@db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = createRouter({
  get: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(siteSettings).limit(1);
    if (rows.length === 0) {
      // Seed default settings
      await db.insert(siteSettings).values({
        defaultResponseHours: 72,
        admissionFee: 100,
        removalFee: 500,
        whatsappNumber: "+1 901 860 4456",
        telegramLink: "",
      });
      const newRows = await db.select().from(siteSettings).limit(1);
      return newRows[0];
    }
    return rows[0];
  }),

  update: publicQuery
    .input(z.object({
      defaultResponseHours: z.number().optional(),
      admissionFee: z.number().optional(),
      removalFee: z.number().optional(),
      whatsappNumber: z.string().optional(),
      telegramLink: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(siteSettings).limit(1);
      if (rows.length === 0) {
        await db.insert(siteSettings).values(input);
      } else {
        await db.update(siteSettings).set(input).where(eq(siteSettings.id, rows[0].id));
      }
      return { success: true };
    }),
});
