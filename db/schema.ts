import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["pending", "confirmed", "expired", "completed"]);

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  challengerTeam: varchar("challenger_team", { length: 255 }).notNull(),
  challengerDiscord: varchar("challenger_discord", { length: 255 }),
  challengerTwitch: varchar("challenger_twitch", { length: 255 }),
  challengerPlatformId: varchar("challenger_platform_id", { length: 255 }),
  targetTeam: varchar("target_team", { length: 255 }).notNull(),
  targetDiscord: varchar("target_discord", { length: 255 }),
  targetTwitch: varchar("target_twitch", { length: 255 }),
  targetPlatformId: varchar("target_platform_id", { length: 255 }),
  game: varchar("game", { length: 255 }).notNull(),
  battleType: varchar("battle_type", { length: 255 }).notNull(),
  stakeAmount: integer("stake_amount").notNull().default(100),
  responseDeadlineHours: integer("response_deadline_hours").notNull().default(72),
  status: statusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  completedAt: timestamp("completed_at"),
  winner: varchar("winner", { length: 255 }),
  notes: text("notes"),
});

export const shameEntries = pgTable("shame_entries", {
  id: serial("id").primaryKey(),
  teamName: varchar("team_name", { length: 255 }).notNull(),
  discord: varchar("discord", { length: 255 }),
  twitch: varchar("twitch", { length: 255 }),
  platformId: varchar("platform_id", { length: 255 }),
  game: varchar("game", { length: 255 }).notNull(),
  battleType: varchar("battle_type", { length: 255 }).notNull(),
  challengerTeam: varchar("challenger_team", { length: 255 }).notNull(),
  expiredAt: timestamp("expired_at").notNull().defaultNow(),
  removalFee: integer("removal_fee").notNull().default(500),
  paidRemoval: boolean("paid_removal").notNull().default(false),
  notes: text("notes"),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  defaultResponseHours: integer("default_response_hours").notNull().default(72),
  admissionFee: integer("admission_fee").notNull().default(100),
  removalFee: integer("removal_fee").notNull().default(500),
  whatsappNumber: varchar("whatsapp_number", { length: 50 }).notNull().default("+1 901 860 4456"),
  telegramLink: varchar("telegram_link", { length: 500 }).default(""),
});
