import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  createChallenge,
  getChallengeById,
  getActiveChallenges,
  getConfirmedBattles,
  getWallOfChickens,
  getAllChallenges,
  checkAndExpireChallenges,
  getChallengeStats,
  updateChallenge,
} from "./queries/challenges";

export const challengeRouter = createRouter({
  // ─── Public: Create a new challenge ───────────────────────────────────────
  create: publicQuery
    .input(
      z.object({
        challengerClan: z.string().min(1, "Challenger clan name is required").max(255),
        challengerContact: z.string().email("Valid email required"),
        challengerDiscord: z.string().optional(),
        targetClan: z.string().min(1, "Target clan name is required").max(255),
        targetContact: z.string().email().optional().or(z.literal("")),
        game: z.string().min(1, "Game is required").max(255),
        matchType: z.string().min(1, "Match type is required").max(255),
        stakeAmount: z.string().default("100"),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const challenge = await createChallenge(input);
      return { success: true, challenge };
    }),

  // ─── Public: Get challenge by ID ──────────────────────────────────────────
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const challenge = await getChallengeById(input.id);
      if (!challenge) {
        return { success: false, error: "Challenge not found" };
      }
      return { success: true, challenge };
    }),

  // ─── Public: Get active challenges (The Chopping Block) ───────────────────
  active: publicQuery.query(async () => {
    // First expire any overdue challenges
    await checkAndExpireChallenges();
    const activeChallenges = await getActiveChallenges();
    return { success: true, challenges: activeChallenges };
  }),

  // ─── Public: Get confirmed battles ────────────────────────────────────────
  confirmed: publicQuery.query(async () => {
    const battles = await getConfirmedBattles();
    return { success: true, challenges: battles };
  }),

  // ─── Public: Get Wall of Chickens ─────────────────────────────────────────
  wallOfChickens: publicQuery.query(async () => {
    await checkAndExpireChallenges();
    const chickens = await getWallOfChickens();
    return { success: true, challenges: chickens };
  }),

  // ─── Public: Get all challenges (for admin) ───────────────────────────────
  list: publicQuery.query(async () => {
    await checkAndExpireChallenges();
    const allChallenges = await getAllChallenges();
    return { success: true, challenges: allChallenges };
  }),

  // ─── Public: Get stats ────────────────────────────────────────────────────
  stats: publicQuery.query(async () => {
    await checkAndExpireChallenges();
    const stats = await getChallengeStats();
    return { success: true, stats };
  }),

  // ─── Public: Accept a challenge (by target clan) ──────────────────────────
  accept: publicQuery
    .input(
      z.object({
        id: z.number(),
        targetContact: z.string().email().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const challenge = await getChallengeById(input.id);
      if (!challenge) {
        return { success: false, error: "Challenge not found" };
      }
      if (challenge.status !== "active") {
        return { success: false, error: "Challenge is not active" };
      }

      const updates: Record<string, unknown> = { status: "accepted" as const, acceptedAt: new Date() };
      if (input.targetContact) {
        updates.targetContact = input.targetContact;
      }

      await updateChallenge(input.id, updates);
      return { success: true, message: "Challenge accepted" };
    }),

  // ─── Public: Complete a challenge with results ────────────────────────────
  complete: publicQuery
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
      if (challenge.status !== "accepted") {
        return { success: false, error: "Challenge must be accepted first" };
      }

      await updateChallenge(input.id, {
        status: "completed",
        winnerClan: input.winnerClan,
        matchResult: input.matchResult,
        streamUrl: input.streamUrl,
        completedAt: new Date(),
      });
      return { success: true, message: "Challenge completed" };
    }),
});
