import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const gardenDeviceTokensTable = pgTable("garden_device_tokens", {
  id: serial("id").primaryKey(),
  flat: text("flat").notNull().unique(),
  token: text("token").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type GardenDeviceToken = typeof gardenDeviceTokensTable.$inferSelect;
