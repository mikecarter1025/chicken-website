import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { shameEntries } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const shameRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(shameEntries).orderBy(desc(shameEntries.expiredAt));
  }),

  listUnpaid: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(shameEntries)
      .where(eq(shameEntries.paidRemoval, false))
      .orderBy(desc(shameEntries.expiredAt));
  }),

  create: publicQuery
    .input(z.object({
      teamName: z.string().min(1),
      discord: z.string().optional(),
      twitch: z.string().optional(),
      platformId: z.string().optional(),
      game: z.string().min(1),
      battleType: z.string().min(1),
      challengerTeam: z.string().min(1),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(shameEntries).values(input);
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(z.object({
      id: z.number(),
      teamName: z.string().optional(),
      discord: z.string().optional(),
      twitch: z.string().optional(),
      platformId: z.string().optional(),
      game: z.string().optional(),
      battleType: z.string().optional(),
      challengerTeam: z.string().optional(),
      paidRemoval: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const db = getDb();
      await db.update(shameEntries).set(updates).where(eq(shameEntries.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(shameEntries).where(eq(shameEntries.id, input.id));
      return { success: true };
    }),

  deleteBulk: publicQuery
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const id of input.ids) {
        await db.delete(shameEntries).where(eq(shameEntries.id, id));
      }
      return { success: true, deleted: input.ids.length };
    }),

  markPaid: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(shameEntries)
        .set({ paidRemoval: true })
        .where(eq(shameEntries.id, input.id));
      return { success: true };
    }),
});
