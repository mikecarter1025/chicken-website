import { getDb } from "./connection";
import { payments } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import type { Payment } from "@db/schema";

// ─── Create ─────────────────────────────────────────────────────────────────
export async function createPayment(data: {
  challengeId: number;
  invoiceId: string;
  invoiceUrl?: string;
  type: Payment["type"];
  amountUsd: number;
  coin: string;
  amountCrypto?: number;
  expiresAt?: Date;
}): Promise<Payment> {
  const db = getDb();
  const [{ id }] = await db.insert(payments).values({
    challengeId: data.challengeId,
    invoiceId: data.invoiceId,
    invoiceUrl: data.invoiceUrl,
    type: data.type,
    amountUsd: data.amountUsd.toFixed(2),
    coin: data.coin,
    amountCrypto: data.amountCrypto?.toFixed(8),
    status: "pending",
    expiresAt: data.expiresAt,
  }).$returningId();

  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, id),
  });
  if (!payment) throw new Error("Failed to create payment");
  return payment;
}

// ─── Read ───────────────────────────────────────────────────────────────────
export async function getPaymentByInvoiceId(invoiceId: string): Promise<Payment | null> {
  const db = getDb();
  const payment = await db.query.payments.findFirst({
    where: eq(payments.invoiceId, invoiceId),
  });
  return payment ?? null;
}

export async function getPaymentsByChallengeId(challengeId: number): Promise<Payment[]> {
  const db = getDb();
  return db
    .select()
    .from(payments)
    .where(eq(payments.challengeId, challengeId))
    .orderBy(desc(payments.createdAt));
}

export async function getAllPayments(): Promise<Payment[]> {
  const db = getDb();
  return db.select().from(payments).orderBy(desc(payments.createdAt));
}

// ─── Update ─────────────────────────────────────────────────────────────────
export async function updatePaymentStatus(
  invoiceId: string,
  status: Payment["status"],
  extra?: Partial<Payment>,
): Promise<void> {
  const db = getDb();
  const updates: Record<string, unknown> = { status, ...extra };
  if (status === "paid") {
    updates.paidAt = new Date();
  }
  await db.update(payments).set(updates).where(eq(payments.invoiceId, invoiceId));
}

export async function recordWebhookData(
  invoiceId: string,
  webhookData: string,
): Promise<void> {
  const db = getDb();
  await db
    .update(payments)
    .set({ webhookData })
    .where(eq(payments.invoiceId, invoiceId));
}
