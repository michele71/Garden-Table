import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface Reservation {
  id: string;
  timeSlot: string;
  name: string;
  partySize: number;
  date: string;
}

interface ReservationsContextValue {
  reservations: Reservation[];
  todayKey: string;
  formattedDate: string;
  addReservation: (timeSlot: string, name: string, partySize: number) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const ReservationsContext = createContext<ReservationsContextValue | null>(null);

function getTodayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const STORAGE_KEY_PREFIX = "garden_reservations_";

export function ReservationsProvider({ children }: { children: React.ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const todayKey = getTodayKey();
  const formattedDate = getFormattedDate();

  const load = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${todayKey}`);
      if (stored) {
        setReservations(JSON.parse(stored) as Reservation[]);
      } else {
        setReservations([]);
      }
    } catch {
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  }, [todayKey]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(
    async (updated: Reservation[]) => {
      await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${todayKey}`, JSON.stringify(updated));
      setReservations(updated);
    },
    [todayKey]
  );

  const addReservation = useCallback(
    async (timeSlot: string, name: string, partySize: number) => {
      const newR: Reservation = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        timeSlot,
        name,
        partySize,
        date: todayKey,
      };
      await persist([...reservations, newR]);
    },
    [reservations, persist, todayKey]
  );

  const cancelReservation = useCallback(
    async (id: string) => {
      await persist(reservations.filter((r) => r.id !== id));
    },
    [reservations, persist]
  );

  return (
    <ReservationsContext.Provider
      value={{ reservations, todayKey, formattedDate, addReservation, cancelReservation, isLoading, refresh: load }}
    >
      {children}
    </ReservationsContext.Provider>
  );
}

export function useReservations(): ReservationsContextValue {
  const ctx = useContext(ReservationsContext);
  if (!ctx) throw new Error("useReservations must be used within ReservationsProvider");
  return ctx;
}
