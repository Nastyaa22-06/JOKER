import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const jokerRooms = sqliteTable("joker_rooms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  visibility: text("visibility", { enum: ["public", "private"] }).notNull(),
  mode: text("mode", { enum: ["full", "nines4", "nines2"] }).notNull(),
  passwordHash: text("password_hash"),
  playerCount: integer("player_count").notNull().default(1),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const advertisingRequests = sqliteTable("advertising_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  placement: text("placement", { enum: ["lobby_week", "table_week", "sponsor_month"] }).notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  brandUrl: text("brand_url"),
  message: text("message"),
  status: text("status", { enum: ["new", "contacted", "approved", "closed"] }).notNull().default("new"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const jokerProfiles = sqliteTable("joker_profiles", {
  identityKey: text("identity_key").primaryKey(),
  provider: text("provider", { enum: ["google", "facebook", "email"] }).notNull(),
  avatarJson: text("avatar_json").notNull(),
  coins: integer("coins").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const jokerCoinEvents = sqliteTable("joker_coin_events", {
  eventId: text("event_id").primaryKey(),
  identityKey: text("identity_key").notNull(),
  action: text("action", { enum: ["finish", "leave"] }).notNull(),
  delta: integer("delta").notNull(),
  applied: integer("applied", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
