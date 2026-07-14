import { getDb } from "./connection";
import { challenges } from "@db/schema";
import { eq, desc, and, or, lt } from "drizzle-orm";
import type { Challenge } from "@db/schema";

// ─── Create ─────────────────────────────────────────────────────────────────
export async function createChallenge(data: {
  challengerClan: string;
  challengerContact: string;
  challengerDiscord?: string;
  targetClan: string;
  targetContact?: string;
  game: string;
  matchType: string;
  stakeAmount?: string;
  description?: string;
}): Promise<Challenge> {
  const db = getDb();
  const [{ id }] = await db.insert(challenges).values({
    challengerClan: data.challengerClan,
    challengerContact: data.challengerContact,
    challengerDiscord: data.challengerDiscord,
    targetClan: data.targetClan,
    targetContact: data.targetContact,
    game: data.game,
    matchType: data.matchType,
    stakeAmount: data.stakeAmount ?? "100",
    description: data.description,
    status: "pending",
  }).$returningId();

  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, id),
  });
  if (!challenge) throw new Error("Failed to create challenge");
  return challenge;
}

// ─── Read ───────────────────────────────────────────────────────────────────
export async function getChallengeById(id: number): Promise<Challenge | null> {
  const db = getDb();
  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, id),
  });
  return challenge ?? null;
}

export async function getActiveChallenges(): Promise<Challenge[]> {
  const db = getDb();
  return db
    .select()
    .from(challenges)
    .where(eq(challenges.status, "active"))
    .orderBy(desc(challenges.paidAt));
}

export async function getConfirmedBattles(): Promise<Challenge[]> {
  const db = getDb();
  return db
    .select()
    .from(challenges)
    .where(eq(challenges.status, "accepted"))
    .orderBy(desc(challenges.acceptedAt));
}

export async function getWallOfChickens(): Promise<Challenge[]> {
  const db = getDb();
  return db
    .select()
    .from(challenges)
    .where(or(eq(challenges.status, "expired"), eq(challenges.status, "scrubbed")))
    .orderBy(desc(challenges.expiresAt));
}

export async function getPendingChallenges(): Promise<Challenge[]> {
  const db = getDb();
  return db
    .select()
    .from(challenges)
    .where(eq(challenges.status, "pending"))
    .orderBy(desc(challenges.createdAt));
}

export async function getAllChallenges(): Promise<Challenge[]> {
  const db = getDb();
  return db.select().from(challenges).orderBy(desc(challenges.createdAt));
}

// ─── Update ─────────────────────────────────────────────────────────────────
export async function updateChallengeStatus(
  id: number,
  status: Challenge["status"],
  extra?: Partial<Challenge>,
): Promise<void> {
  const db = getDb();
  const updates: Record<string, unknown> = { status, ...extra };

  if (status === "active") {
    updates.paidAt = new Date();
    // 72 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);
    updates.expiresAt = expiresAt;
  }
  if (status === "accepted") {
    updates.acceptedAt = new Date();
  }
  if (status === "completed") {
    updates.completedAt = new Date();
  }
  if (status === "scrubbed") {
    updates.scrubbedAt = new Date();
    updates.scrubFeePaid = "yes";
  }

  await db.update(challenges).set(updates).where(eq(challenges.id, id));
}

export async function markChallengeExpired(id: number): Promise<void> {
  const db = getDb();
  await db
    .update(challenges)
    .set({ status: "expired" })
    .where(eq(challenges.id, id));
}

export async function updateChallenge(
  id: number,
  data: Partial<Challenge>,
): Promise<void> {
  const db = getDb();
  await db.update(challenges).set(data).where(eq(challenges.id, id));
}

// ─── Check Expired ──────────────────────────────────────────────────────────
export async function checkAndExpireChallenges(): Promise<number> {
  const db = getDb();
  const now = new Date();
  const expired = await db
    .select()
    .from(challenges)
    .where(and(eq(challenges.status, "active"), lt(challenges.expiresAt, now)));

  for (const ch of expired) {
    await markChallengeExpired(ch.id);
  }

  return expired.length;
}

// ─── Stats ──────────────────────────────────────────────────────────────────
export async function getChallengeStats(): Promise<{
  total: number;
  active: number;
  accepted: number;
  expired: number;
  completed: number;
  scrubbed: number;
  pending: number;
  revenue: number;
}> {
  const db = getDb();
  const all = await db.select().from(challenges);

  const active = all.filter((c) => c.status === "active").length;
  const accepted = all.filter((c) => c.status === "accepted").length;
  const expired = all.filter((c) => c.status === "expired").length;
  const completed = all.filter((c) => c.status === "completed").length;
  const scrubbed = all.filter((c) => c.status === "scrubbed").length;
  const pending = all.filter((c) => c.status === "pending").length;

  // Calculate rough revenue
  let revenue = 0;
  for (const c of all) {
    if (c.status === "active" || c.status === "accepted" || c.status === "completed") {
      revenue += parseFloat(c.stakeAmount ?? "100");
    }
    if (c.status === "accepted" || c.status === "completed") {
      revenue += parseFloat(c.stakeAmount ?? "100");
    }
    if (c.status === "scrubbed") {
      revenue += parseFloat(c.scrubFeeAmount ?? "150");
    }
  }

  return {
    total: all.length,
    active,
    accepted,
    expired,
    completed,
    scrubbed,
    pending,
    revenue,
  };
}
