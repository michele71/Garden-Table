import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getListGardenReservationsQueryKey,
  useCreateGardenReservation,
  useDeleteGardenReservation,
  useListGardenReservations,
  type GardenReservation,
} from "@workspace/api-client-react";

import { DayCard } from "@/components/DayCard";
import { ReservationSheet } from "@/components/ReservationSheet";
import { useColors } from "@/hooks/useColors";

const gardenBg = require("../../assets/images/garden-bg.jpg");

function getWeekMonday(): string {
  const today = new Date();
  const dow = today.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const d = String(monday.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getTodayKey(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getWeekDates(weekStart: string): string[] {
  const monday = new Date(weekStart + "T12:00:00");
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${day}`;
  });
}

function getWeekLabel(weekStart: string): string {
  const monday = new Date(weekStart + "T12:00:00");
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const monLabel = monday.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const sunLabel = sunday.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `${monLabel} – ${sunLabel}`;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const weekStart = useMemo(() => getWeekMonday(), []);
  const todayKey = useMemo(() => getTodayKey(), []);
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const weekLabel = useMemo(() => getWeekLabel(weekStart), [weekStart]);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: reservations = [], isLoading, refetch } = useListGardenReservations({ weekStart });

  const createMutation = useCreateGardenReservation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListGardenReservationsQueryKey({ weekStart }),
        });
      },
    },
  });

  const deleteMutation = useDeleteGardenReservation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListGardenReservationsQueryKey({ weekStart }),
        });
      },
    },
  });

  const handleBook = useCallback((date: string) => {
    setSelectedDate(date);
    setSheetVisible(true);
  }, []);

  const handleConfirm = useCallback(
    async (name: string, partySize: number) => {
      if (!selectedDate) return;
      setSheetVisible(false);
      createMutation.mutate({ data: { date: selectedDate, name, partySize } });
    },
    [selectedDate, createMutation]
  );

  const handleCancel = useCallback(
    (id: number) => {
      deleteMutation.mutate({ id });
    },
    [deleteMutation]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const reservationByDate = useMemo(() => {
    const map = new Map<string, GardenReservation>();
    for (const r of reservations) {
      map.set(r.date, r);
    }
    return map;
  }, [reservations]);

  const bookedCount = reservations.length;
  const availableCount = weekDates.filter((d) => d >= todayKey && !reservationByDate.has(d)).length;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    hero: {
      height: Platform.OS === "web" ? 200 : 195 + insets.top,
    },
    heroGradient: {
      flex: 1,
      justifyContent: "flex-end",
      paddingHorizontal: 24,
      paddingBottom: 22,
      paddingTop: Platform.OS === "web" ? 67 : insets.top,
    },
    pillRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    pillText: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    heroTitle: {
      fontSize: 30,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      letterSpacing: -0.6,
    },
    heroSubtitle: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.8)",
      marginTop: 3,
    },
    statsRow: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 8,
    },
    stat: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNumber: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 1,
    },
    sectionHeader: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 10,
    },
    sectionTitle: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    list: {
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 90,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ImageBackground source={gardenBg} style={styles.hero} resizeMode="cover">
        <LinearGradient
          colors={["rgba(0,0,0,0.15)", "rgba(20,40,20,0.82)"]}
          style={styles.heroGradient}
        >
          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>🌿 Evening slot</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>The Garden Table</Text>
          <Text style={styles.heroSubtitle}>{weekLabel}</Text>
        </LinearGradient>
      </ImageBackground>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{availableCount}</Text>
            <Text style={styles.statLabel}>Open this week</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{bookedCount}</Text>
            <Text style={styles.statLabel}>Reserved</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statLabel}>Total days</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This week</Text>
        </View>

        <View style={styles.list}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            weekDates.map((date) => (
              <DayCard
                key={date}
                date={date}
                reservation={reservationByDate.get(date)}
                isToday={date === todayKey}
                isPast={date < todayKey}
                onBook={handleBook}
                onCancel={handleCancel}
              />
            ))
          )}
        </View>
      </ScrollView>

      {selectedDate && (
        <ReservationSheet
          visible={sheetVisible}
          timeSlot={selectedDate}
          displayTime={new Date(selectedDate + "T12:00:00").toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
          onConfirm={handleConfirm}
          onClose={() => setSheetVisible(false)}
        />
      )}
    </View>
  );
}
