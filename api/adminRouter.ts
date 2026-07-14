import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import {
  getAllChallenges,
  getChallengeById,
  updateChallenge,
  updateChallengeStatus,
  getChallengeStats,
  checkAndExpireChallenges,
} from "./queries/challenges";
import { getAllPayments } from "./queries/payments";

export const adminRouter = createRouter({
  // ─── Get all challenges ───────────────────────────────────────────────────
  challenges: adminQuery.query(async () => {
    await checkAndExpireChallenges();
    const challenges = await getAllChallenges();
    return { success: true, challenges };
  }),

  // ─── Get challenge by ID ──────────────────────────────────────────────────
  challengeById: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const challenge = await getChallengeById(input.id);
      if (!challenge) {
        return { success: false, error: "Challenge not found" };
      }
      return { success: true, challenge };
    }),

  // ─── Update challenge ─────────────────────────────────────────────────────
  updateChallenge: adminQuery
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          challengerClan: z.string().optional(),
          challengerContact: z.string().optional(),
          challengerDiscord: z.string().optional(),
          targetClan: z.string().optional(),
          targetContact: z.string().optional(),
          game: z.string().optional(),
          matchType: z.string().optional(),
          description: z.string().optional(),
          winnerClan: z.string().optional(),
          matchResult: z.string().optional(),
          streamUrl: z.string().optional(),
          adminNotes: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      await updateChallenge(input.id, input.data);
      return { success: true, message: "Challenge updated" };
    }),

  // ─── Update challenge status ──────────────────────────────────────────────
  updateStatus: adminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "pending",
          "active",
          "accepted",
          "expired",
          "completed",
          "scrubbed",
        ]),
      }),
    )
    .mutation(async ({ input }) => {
      await updateChallengeStatus(input.id, input.status);
      return { success: true, message: "Status updated" };
    }),

  // ─── Mark challenge as completed with results ─────────────────────────────
  completeChallenge: adminQuery
    .input(
      z.object({
        id: z.number(),
        winnerClan: z.string().min(1),
        matchResult: z.string().optional(),
        streamUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const challenge = await getChallengeById(input.id);
      if (!challenge) {
        return { success: false, error: "Challenge not found" };
      }

      await updateChallenge(input.id, {
        status: "completed",
        winnerClan: input.winnerClan,
        matchResult: input.matchResult,
        streamUrl: input.streamUrl,
        completedAt: new Date(),
      });

      return { success: true, message: "Challenge marked as completed" };
    }),

  // ─── Get stats ────────────────────────────────────────────────────────────
  stats: adminQuery.query(async () => {
    await checkAndExpireChallenges();
    const stats = await getChallengeStats();
    return { success: true, stats };
  }),

  // ─── Get all payments ─────────────────────────────────────────────────────
  payments: adminQuery.query(async () => {
    const payments = await getAllPayments();
    return { success: true, payments };
  }),

  // ─── Expire overdue challenges ────────────────────────────────────────────
  expireOverdue: adminQuery.query(async () => {
    const count = await checkAndExpireChallenges();
    return { success: true, expired: count };
  }),
});
