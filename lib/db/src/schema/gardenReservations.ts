import { boolean, date, integer, pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gardenReservationsTable = pgTable(
  "garden_reservations",
  {
    id: serial("id").primaryKey(),
    date: date("date", { mode: "string" }).notNull(),
    slot: text("slot").notNull().default("evening"),
    name: text("name").notNull(),
    partySize: integer("party_size").notNull(),
    isPrivate: boolean("is_private").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("garden_reservations_date_slot_unique").on(table.date, table.slot),
  ]
);

export const insertGardenReservationSchema = createInsertSchema(gardenReservationsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertGardenReservation = z.infer<typeof insertGardenReservationSchema>;
export type GardenReservation = typeof gardenReservationsTable.$inferSelect;
