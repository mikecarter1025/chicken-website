import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  decimal,
  bigint,
  index,
} from "drizzle-orm/mysql-core";

// ─── Users (from auth) ──────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Challenges ──────────────────────────────────────────────────────────────
export const challengeStatusEnum = [
  "pending",      // Created, awaiting payment
  "active",       // Paid, on chopping block (72hr countdown)
  "accepted",     // Target paid to accept, match confirmed
  "expired",      // Timer ran out, moved to Wall of Chickens
  "completed",    // Match was played
  "scrubbed",     // Paid reputation scrub fee
] as const;

export const challenges = mysqlTable(
  "challenges",
  {
    id: serial("id").primaryKey(),
    // Challenger (the one calling out)
    challengerClan: varchar("challenger_clan", { length: 255 }).notNull(),
    challengerContact: varchar("challenger_contact", { length: 320 }).notNull(),
    challengerDiscord: varchar("challenger_discord", { length: 255 }),

    // Target (the one being called out)
    targetClan: varchar("target_clan", { length: 255 }).notNull(),
    targetContact: varchar("target_contact", { length: 320 }),

    // Match details
    game: varchar("game", { length: 255 }).notNull(),
    matchType: varchar("match_type", { length: 255 }).notNull(),
    stakeAmount: varchar("stake_amount", { length: 50 }).notNull().default("100"),
    description: text("description"),

    // Status & timing
    status: mysqlEnum("status", challengeStatusEnum)
      .default("pending")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    paidAt: timestamp("paid_at"),
    expiresAt: timestamp("expires_at"),
    acceptedAt: timestamp("accepted_at"),
    completedAt: timestamp("completed_at"),
    scrubbedAt: timestamp("scrubbed_at"),

    // Match result
    winnerClan: varchar("winner_clan", { length: 255 }),
    matchResult: text("match_result"),
    streamUrl: varchar("stream_url", { length: 500 }),

    // Admin notes
    adminNotes: text("admin_notes"),

    // Scrub fee tracking
    scrubFeePaid: mysqlEnum("scrub_fee_paid", ["no", "yes"]).default("no").notNull(),
    scrubFeeAmount: varchar("scrub_fee_amount", { length: 50 }).default("150"),
  },
  (table) => ({
    statusIdx: index("status_idx").on(table.status),
    targetClanIdx: index("target_clan_idx").on(table.targetClan),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
);

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

// ─── Payments (CoinRemitter) ────────────────────────────────────────────────
export const paymentStatusEnum = [
  "pending",      // Invoice created, awaiting payment
  "paid",         // Payment confirmed
  "underpaid",    // Partial payment received
  "overpaid",     // Overpayment
  "expired",      // Invoice expired
  "cancelled",    // Cancelled
] as const;

export const paymentTypeEnum = [
  "challenge_fee",    // $100 to create challenge
  "accept_fee",       // $100 to accept challenge
  "scrub_fee",        // $150 to remove from wall
] as const;

export const payments = mysqlTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    challengeId: bigint("challenge_id", { mode: "number", unsigned: true }).notNull(),

    // CoinRemitter invoice details
    invoiceId: varchar("invoice_id", { length: 255 }).notNull().unique(),
    invoiceUrl: varchar("invoice_url", { length: 500 }),

    // Payment info
    type: mysqlEnum("type", paymentTypeEnum).notNull(),
    amountUsd: decimal("amount_usd", { precision: 10, scale: 2 }).notNull(),
    coin: varchar("coin", { length: 50 }).notNull(),
    amountCrypto: decimal("amount_crypto", { precision: 20, scale: 8 }),

    // Status tracking
    status: mysqlEnum("status", paymentStatusEnum).default("pending").notNull(),
    txId: varchar("tx_id", { length: 255 }),
    confirmations: int("confirmations").default(0),
    paidAmount: decimal("paid_amount", { precision: 20, scale: 8 }),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    paidAt: timestamp("paid_at"),
    expiresAt: timestamp("expires_at"),

    // CoinRemitter webhook payload (for reference)
    webhookData: text("webhook_data"),
  },
  (table) => ({
    challengeIdIdx: index("payment_challenge_idx").on(table.challengeId),
    invoiceIdIdx: index("invoice_idx").on(table.invoiceId),
    statusIdx: index("payment_status_idx").on(table.status),
  })
);

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// ─── Site Settings ───────────────────────────────────────────────────────────
export const settings = mysqlTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;
