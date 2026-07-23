import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getListGardenReservationsQueryKey,
  useDeleteGardenReservation,
  useListGardenReservations,
} from "@workspace/api-client-react";

import { useMyFlat } from "@/contexts/MyFlatContext";
import { useColors } from "@/hooks/useColors";

const FLATS = ["Flat 1", "Flat 2", "Flat 3", "Flat 4", "Flat 5", "Flat 6", "Flat 7"];

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function MyBookingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { myFlat, flatLoaded, selectFlat } = useMyFlat();
  const [refreshing, setRefreshing] = useState(false);

  const weekStart = useMemo(() => getWeekMonday(), []);

  const { data: reservations = [], isLoading, refetch } = useListGardenReservations({ weekStart });

  const myReservations = useMemo(
    () => (myFlat ? reservations.filter((r) => r.name === myFlat) : []),
    [reservations, myFlat]
  );

  const deleteMutation = useDeleteGardenReservation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListGardenReservationsQueryKey({ weekStart }),
        });
      },
    },
  });

  const handleCancel = useCallback(
    (id: number) => {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      deleteMutation.mutate({ id });
    },
    [deleteMutation]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 24,
      paddingBottom: 20,
    },
    heading: {
      fontSize: 32,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: -0.8,
    },
    subtitle: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 4,
    },
    section: {
      paddingHorizontal: 24,
    },
    sectionLabel: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 14,
    },
    flatsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    flatBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1.5,
    },
    flatBtnSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    flatBtnUnselected: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    flatBtnText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    flatBtnTextSelected: { color: colors.primaryForeground },
    flatBtnTextUnselected: { color: colors.foreground },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 24,
      marginVertical: 24,
    },
    bookingsSection: {
      paddingHorizontal: 24,
      paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 90,
    },
    bookingCard: {
      backgroundColor: colors.accent + "12",
      borderRadius: colors.radius,
      borderWidth: 1.5,
      borderColor: colors.accent + "44",
      padding: 18,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    bookingIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.accent + "22",
      alignItems: "center",
      justifyContent: "center",
    },
    bookingInfo: { flex: 1 },
    bookingDate: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      letterSpacing: -0.2,
    },
    bookingGuests: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    cancelBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyBox: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: "dashed",
      padding: 32,
      alignItems: "center",
      gap: 10,
    },
    emptyTitle: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    promptBox: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 24,
      alignItems: "center",
      gap: 10,
    },
    promptText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>My Flat</Text>
        <Text style={styles.subtitle}>Your bookings this week</Text>
      </View>

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
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Which flat are you?</Text>
          <View style={styles.flatsGrid}>
            {FLATS.map((flat) => (
              <Pressable
                key={flat}
                style={[
                  styles.flatBtn,
                  myFlat === flat ? styles.flatBtnSelected : styles.flatBtnUnselected,
                ]}
                onPress={() => selectFlat(flat)}
              >
                <Text
                  style={[
                    styles.flatBtnText,
                    myFlat === flat
                      ? styles.flatBtnTextSelected
                      : styles.flatBtnTextUnselected,
                  ]}
                >
                  {flat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bookingsSection}>
          <Text style={styles.sectionLabel}>
            {myFlat ? `${myFlat}'s reservations` : "Your reservations"}
          </Text>

          {!flatLoaded || isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : !myFlat ? (
            <View style={styles.promptBox}>
              <Feather name="home" size={28} color={colors.mutedForeground} />
              <Text style={styles.promptText}>
                Select your flat above to see your bookings
              </Text>
            </View>
          ) : myReservations.length === 0 ? (
            <View style={styles.emptyBox}>
              <Feather name="calendar" size={28} color={colors.mutedForeground} />
              <Text style={styles.emptyTitle}>No bookings this week</Text>
              <Text style={styles.emptyText}>
                Go to the This Week tab to reserve an evening slot
              </Text>
            </View>
          ) : (
            myReservations.map((r) => (
              <View key={r.id} style={styles.bookingCard}>
                <View style={styles.bookingIconWrap}>
                  <Feather name="sun" size={18} color={colors.accent} />
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingDate}>{formatDate(r.date)}</Text>
                  <Text style={styles.bookingGuests}>
                    {r.partySize} {r.partySize === 1 ? "guest" : "guests"} · {r.slot === "lunch" ? "Lunch slot" : "Evening slot"}
                  </Text>
                </View>
                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => handleCancel(r.id)}
                >
                  <Feather name="x" size={15} color={colors.mutedForeground} />
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
