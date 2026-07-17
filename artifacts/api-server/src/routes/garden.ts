import { Router, type IRouter } from "express";
import { and, gte, lte, eq, ne } from "drizzle-orm";
import { db, gardenReservationsTable, gardenDeviceTokensTable } from "@workspace/db";
import {
  CreateGardenReservationBody,
  DeleteGardenReservationParams,
  ListGardenReservationsQueryParams,
  RegisterGardenTokenBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

// ─── Push helper ────────────────────────────────────────────────────────────

async function sendPushToOtherFlats(
  bookedFlat: string,
  title: string,
  body: string
): Promise<void> {
  const tokens = await db
    .select()
    .from(gardenDeviceTokensTable)
    .where(ne(gardenDeviceTokensTable.flat, bookedFlat));

  if (tokens.length === 0) return;

  const messages = tokens.map((t) => ({
    to: t.token,
    sound: "default" as const,
    title,
    body,
    data: { bookedFlat },
  }));

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(messages),
  });
}

// ─── Routes ─────────────────────────────────────────────────────────────────

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

  // Fire-and-forget: notify other flats
  const dayName = new Date(parsed.data.date + "T12:00:00Z").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  sendPushToOtherFlats(
    parsed.data.name,
    "Garden booked 🌿",
    `${parsed.data.name} booked ${dayName}`
  ).catch(() => {});

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

router.post("/garden/tokens", async (req, res): Promise<void> => {
  const parsed = RegisterGardenTokenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db
    .insert(gardenDeviceTokensTable)
    .values({ flat: parsed.data.flat, token: parsed.data.token })
    .onConflictDoUpdate({
      target: gardenDeviceTokensTable.flat,
      set: {
        token: parsed.data.token,
        updatedAt: new Date(),
      },
    });

  res.sendStatus(204);
});

export default router;
