import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  createPayment,
  getPaymentByInvoiceId,
  getPaymentsByChallengeId,
  updatePaymentStatus,
  recordWebhookData,
} from "./queries/payments";
import {
  getChallengeById,
  updateChallengeStatus,
} from "./queries/challenges";

// ─── CoinRemitter API Client ────────────────────────────────────────────────
const COINREMITTER_API_KEY = process.env.COINREMITTER_API_KEY ?? "";
const COINREMITTER_PASSWORD = process.env.COINREMITTER_PASSWORD ?? "";
const COINREMITTER_BASE_URL = "https://coinremitter.com/api/v3";

interface CoinRemitterInvoice {
  id: string;
  invoice_id: string;
  url: string;
  status: string;
  coin: string;
  amount_in_usd: string;
  total_amount: string;
  paid_amount: string;
  conversion_rate: string;
  expiry_date: string;
  name?: string;
  description?: string;
}

async function coinremitterRequest(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<{ flag: number; data?: CoinRemitterInvoice; msg?: string }> {
  if (!COINREMITTER_API_KEY || !COINREMITTER_PASSWORD) {
    // Return mock data for development
    return {
      flag: 1,
      data: {
        id: `mock_${Date.now()}`,
        invoice_id: `mock_${Date.now()}`,
        url: "https://coinremitter.com",
        status: "Pending",
        coin: (body.coin as string) || "BTC",
        amount_in_usd: String(body.amount ?? "100"),
        total_amount: "0.0015",
        paid_amount: "0",
        conversion_rate: "65000",
        expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        name: (body.name as string) || "Challenge Fee",
        description: (body.description as string) || "",
      },
    };
  }

  const response = await fetch(`${COINREMITTER_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": COINREMITTER_API_KEY,
      "X-Api-Password": COINREMITTER_PASSWORD,
    },
    body: JSON.stringify(body),
  });

  return response.json() as Promise<{ flag: number; data?: CoinRemitterInvoice; msg?: string }>;
}

// ─── Router ─────────────────────────────────────────────────────────────────
export const paymentRouter = createRouter({
  // ─── Create invoice for challenge fee ─────────────────────────────────────
  createChallengeInvoice: publicQuery
    .input(
      z.object({
        challengeId: z.number(),
        coin: z.string().default("BTC"),
      }),
    )
    .mutation(async ({ input }) => {
      const challenge = await getChallengeById(input.challengeId);
      if (!challenge) {
        return { success: false, error: "Challenge not found" };
      }

      const amount = parseFloat(challenge.stakeAmount ?? "100");
      const result = await coinremitterRequest("/BTC/create-invoice", {
        api_key: COINREMITTER_API_KEY,
        password: COINREMITTER_PASSWORD,
        amount: amount,
        name: `Challenge Fee: ${challenge.challengerClan} vs ${challenge.targetClan}`,
        description: `Challenge in ${challenge.game} - ${challenge.matchType}`,
        coin: input.coin,
      });

      if (result.flag !== 1 || !result.data) {
        return { success: false, error: result.msg || "Failed to create invoice" };
      }

      // Create payment record
      const payment = await createPayment({
        challengeId: input.challengeId,
        invoiceId: result.data.invoice_id,
        invoiceUrl: result.data.url,
        type: "challenge_fee",
        amountUsd: amount,
        coin: input.coin,
        amountCrypto: parseFloat(result.data.total_amount),
        expiresAt: new Date(result.data.expiry_date),
      });

      return { success: true, payment, invoiceUrl: result.data.url };
    }),

  // ─── Create invoice for accept fee ────────────────────────────────────────
  createAcceptInvoice: publicQuery
    .input(
      z.object({
        challengeId: z.number(),
        coin: z.string().default("BTC"),
      }),
    )
    .mutation(async ({ input }) => {
      const challenge = await getChallengeById(input.challengeId);
      if (!challenge) {
        return { success: false, error: "Challenge not found" };
      }

      const amount = parseFloat(challenge.stakeAmount ?? "100");
      const result = await coinremitterRequest("/BTC/create-invoice", {
        api_key: COINREMITTER_API_KEY,
        password: COINREMITTER_PASSWORD,
        amount: amount,
        name: `Accept Challenge: ${challenge.targetClan} vs ${challenge.challengerClan}`,
        description: `Accept challenge in ${challenge.game} - ${challenge.matchType}`,
        coin: input.coin,
      });

      if (result.flag !== 1 || !result.data) {
        return { success: false, error: result.msg || "Failed to create invoice" };
      }

      const payment = await createPayment({
        challengeId: input.challengeId,
        invoiceId: result.data.invoice_id,
        invoiceUrl: result.data.url,
        type: "accept_fee",
        amountUsd: amount,
        coin: input.coin,
        amountCrypto: parseFloat(result.data.total_amount),
        expiresAt: new Date(result.data.expiry_date),
      });

      return { success: true, payment, invoiceUrl: result.data.url };
    }),

  // ─── Create invoice for scrub fee ─────────────────────────────────────────
  createScrubInvoice: publicQuery
    .input(
      z.object({
        challengeId: z.number(),
        coin: z.string().default("BTC"),
      }),
    )
    .mutation(async ({ input }) => {
      const challenge = await getChallengeById(input.challengeId);
      if (!challenge) {
        return { success: false, error: "Challenge not found" };
      }

      const amount = parseFloat(challenge.scrubFeeAmount ?? "150");
      const result = await coinremitterRequest("/BTC/create-invoice", {
        api_key: COINREMITTER_API_KEY,
        password: COINREMITTER_PASSWORD,
        amount: amount,
        name: `Reputation Scrub: ${challenge.targetClan}`,
        description: `Remove from Wall of Chickens`,
        coin: input.coin,
      });

      if (result.flag !== 1 || !result.data) {
        return { success: false, error: result.msg || "Failed to create invoice" };
      }

      const payment = await createPayment({
        challengeId: input.challengeId,
        invoiceId: result.data.invoice_id,
        invoiceUrl: result.data.url,
        type: "scrub_fee",
        amountUsd: amount,
        coin: input.coin,
        amountCrypto: parseFloat(result.data.total_amount),
        expiresAt: new Date(result.data.expiry_date),
      });

      return { success: true, payment, invoiceUrl: result.data.url };
    }),

  // ─── Check invoice status ─────────────────────────────────────────────────
  checkStatus: publicQuery
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ input }) => {
      const payment = await getPaymentByInvoiceId(input.invoiceId);
      if (!payment) {
        return { success: false, error: "Payment not found" };
      }

      // If using real API, check with CoinRemitter
      if (COINREMITTER_API_KEY && COINREMITTER_PASSWORD) {
        const result = await coinremitterRequest("/BTC/get-invoice", {
          api_key: COINREMITTER_API_KEY,
          password: COINREMITTER_PASSWORD,
          invoice_id: input.invoiceId,
          coin: payment.coin,
        });

        if (result.flag === 1 && result.data) {
          const status = result.data.status.toLowerCase();
          let paymentStatus: "pending" | "paid" | "underpaid" | "overpaid" | "expired" | "cancelled" = "pending";

          if (status === "paid") paymentStatus = "paid";
          else if (status === "underpaid") paymentStatus = "underpaid";
          else if (status === "overpaid") paymentStatus = "overpaid";
          else if (status === "expired") paymentStatus = "expired";

          await updatePaymentStatus(input.invoiceId, paymentStatus, {
            paidAmount: result.data.paid_amount,
          });

          // If paid, update challenge status
          if (paymentStatus === "paid") {
            const challenge = await getChallengeById(payment.challengeId);
            if (challenge) {
              if (payment.type === "challenge_fee" && challenge.status === "pending") {
                await updateChallengeStatus(challenge.id, "active");
              } else if (payment.type === "accept_fee" && challenge.status === "active") {
                await updateChallengeStatus(challenge.id, "accepted");
              } else if (payment.type === "scrub_fee" && challenge.status === "expired") {
                await updateChallengeStatus(challenge.id, "scrubbed");
              }
            }
          }
        }
      }

      const updatedPayment = await getPaymentByInvoiceId(input.invoiceId);
      return { success: true, payment: updatedPayment };
    }),

  // ─── Get payments for a challenge ─────────────────────────────────────────
  byChallenge: publicQuery
    .input(z.object({ challengeId: z.number() }))
    .query(async ({ input }) => {
      const payments = await getPaymentsByChallengeId(input.challengeId);
      return { success: true, payments };
    }),

  // ─── Webhook handler for CoinRemitter ─────────────────────────────────────
  webhook: publicQuery
    .input(
      z.object({
        invoice_id: z.string(),
        status: z.string(),
        tx_id: z.string().optional(),
        coin: z.string().optional(),
        paid_amount: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const payment = await getPaymentByInvoiceId(input.invoice_id);
      if (!payment) {
        return { success: false, error: "Payment not found" };
      }

      const status = input.status.toLowerCase();
      let paymentStatus: "pending" | "paid" | "underpaid" | "overpaid" | "expired" | "cancelled" = "pending";

      if (status === "paid") paymentStatus = "paid";
      else if (status === "underpaid") paymentStatus = "underpaid";
      else if (status === "overpaid") paymentStatus = "overpaid";
      else if (status === "expired") paymentStatus = "expired";

      await updatePaymentStatus(input.invoice_id, paymentStatus, {
        txId: input.tx_id,
      });
      await recordWebhookData(input.invoice_id, JSON.stringify(input));

      // Update challenge based on payment type
      if (paymentStatus === "paid") {
        const challenge = await getChallengeById(payment.challengeId);
        if (challenge) {
          if (payment.type === "challenge_fee" && challenge.status === "pending") {
            await updateChallengeStatus(challenge.id, "active");
          } else if (payment.type === "accept_fee" && challenge.status === "active") {
            await updateChallengeStatus(challenge.id, "accepted");
          } else if (payment.type === "scrub_fee" && challenge.status === "expired") {
            await updateChallengeStatus(challenge.id, "scrubbed");
          }
        }
      }

      return { success: true, message: "Webhook processed" };
    }),
});
