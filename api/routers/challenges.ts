import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { challenges } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const challengesRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(challenges).orderBy(desc(challenges.createdAt));
  }),

  listByStatus: publicQuery
    .input(z.object({ status: z.enum(["pending", "confirmed", "expired", "completed"]) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(challenges).where(eq(challenges.status, input.status)).orderBy(desc(challenges.createdAt));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(challenges).where(eq(challenges.id, input.id)).limit(1);
      return rows[0] ?? null;
    }),

  create: publicQuery
    .input(z.object({
      challengerTeam: z.string().min(1),
      challengerDiscord: z.string().optional(),
      challengerTwitch: z.string().optional(),
      challengerPlatformId: z.string().optional(),
      targetTeam: z.string().min(1),
      targetDiscord: z.string().optional(),
      targetTwitch: z.string().optional(),
      targetPlatformId: z.string().optional(),
      game: z.string().min(1),
      battleType: z.string().min(1),
      stakeAmount: z.number().default(100),
      responseDeadlineHours: z.number().default(72),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(challenges).values({
        ...input,
        status: "pending",
      });
      return { id: Number(result[0].insertId) };
    }),

  update: publicQuery
    .input(z.object({
      id: z.number(),
      challengerTeam: z.string().min(1).optional(),
      challengerDiscord: z.string().optional(),
      challengerTwitch: z.string().optional(),
      challengerPlatformId: z.string().optional(),
      targetTeam: z.string().min(1).optional(),
      targetDiscord: z.string().optional(),
      targetTwitch: z.string().optional(),
      targetPlatformId: z.string().optional(),
      game: z.string().optional(),
      battleType: z.string().optional(),
      stakeAmount: z.number().optional(),
      responseDeadlineHours: z.number().optional(),
      status: z.enum(["pending", "confirmed", "expired", "completed"]).optional(),
      acceptedAt: z.date().optional(),
      winner: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const db = getDb();
      await db.update(challenges).set(updates).where(eq(challenges.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(challenges).where(eq(challenges.id, input.id));
      return { success: true };
    }),

  deleteBulk: publicQuery
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const id of input.ids) {
        await db.delete(challenges).where(eq(challenges.id, id));
      }
      return { success: true, deleted: input.ids.length };
    }),

  accept: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(challenges)
        .set({ status: "confirmed", acceptedAt: new Date() })
        .where(eq(challenges.id, input.id));
      return { success: true };
    }),

  expire: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(challenges)
        .set({ status: "expired" })
        .where(eq(challenges.id, input.id));
      return { success: true };
    }),
});
