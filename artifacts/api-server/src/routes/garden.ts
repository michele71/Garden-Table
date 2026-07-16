import { Router, type IRouter } from "express";
import { and, gte, lte, eq } from "drizzle-orm";
import { db, gardenReservationsTable } from "@workspace/db";
import {
  CreateGardenReservationBody,
  DeleteGardenReservationParams,
  ListGardenReservationsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/garden/reservations", async (req, res): Promise<void> => {
  const query = ListGardenReservationsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { weekStart } = query.data;
  const start = new Date(weekStart + "T00:00:00Z");
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const weekEnd = end.toISOString().split("T")[0];

  const reservations = await db
    .select()
    .from(gardenReservationsTable)
    .where(
      and(
        gte(gardenReservationsTable.date, weekStart),
        lte(gardenReservationsTable.date, weekEnd as string)
      )
    );

  res.json(reservations);
});

router.post("/garden/reservations", async (req, res): Promise<void> => {
  const parsed = CreateGardenReservationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(gardenReservationsTable)
    .where(eq(gardenReservationsTable.date, parsed.data.date));

  if (existing.length > 0) {
    res.status(409).json({ error: "This date is already reserved" });
    return;
  }

  const [reservation] = await db
    .insert(gardenReservationsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(reservation);
});

router.delete("/garden/reservations/:id", async (req, res): Promise<void> => {
  const params = DeleteGardenReservationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(gardenReservationsTable)
    .where(eq(gardenReservationsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Reservation not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
