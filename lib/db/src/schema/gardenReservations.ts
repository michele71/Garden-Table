import { date, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gardenReservationsTable = pgTable("garden_reservations", {
  id: serial("id").primaryKey(),
  date: date("date", { mode: "string" }).notNull().unique(),
  name: text("name").notNull(),
  partySize: integer("party_size").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGardenReservationSchema = createInsertSchema(gardenReservationsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertGardenReservation = z.infer<typeof insertGardenReservationSchema>;
export type GardenReservation = typeof gardenReservationsTable.$inferSelect;
