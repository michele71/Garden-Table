import { Feather } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReservationSheet } from "@/components/ReservationSheet";
import { TimeSlotCard } from "@/components/TimeSlotCard";
import { useReservations } from "@/context/ReservationsContext";
import { useColors } from "@/hooks/useColors";

const TIME_SLOTS = [
  { key: "17:00", display: "5:00 PM" },
  { key: "18:00", display: "6:00 PM" },
  { key: "19:00", display: "7:00 PM" },
  { key: "20:00", display: "8:00 PM" },
  { key: "21:00", display: "9:00 PM" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reservations, formattedDate, addReservation, cancelReservation, isLoading, refresh } =
    useReservations();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ key: string; display: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleBook = useCallback((timeSlot: string) => {
    const slot = TIME_SLOTS.find((s) => s.key === timeSlot);
    if (slot) {
      setSelectedSlot(slot);
      setSheetVisible(true);
    }
  }, []);

  const handleConfirm = useCallback(
    async (name: string, partySize: number) => {
      if (!selectedSlot) return;
      setSheetVisible(false);
      await addReservation(selectedSlot.key, name, partySize);
    },
    [selectedSlot, addReservation]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const booked = reservations.length;
  const available = TIME_SLOTS.length - booked;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
      paddingHorizontal: 24,
      paddingBottom: 24,
      backgroundColor: colors.background,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.secondary,
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 16,
    },
    pillText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    heading: {
      fontSize: 32,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: -0.8,
      marginBottom: 4,
    },
    date: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    stat: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNumber: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    sectionHeader: {
      paddingHorizontal: 24,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    slotList: {
      paddingHorizontal: 24,
      paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20,
    },
    emptyNote: {
      backgroundColor: colors.secondary,
      borderRadius: colors.radius,
      padding: 20,
      alignItems: "center",
      gap: 8,
    },
    emptyText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 24,
      marginBottom: 24,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.pill}>
          <Feather name="sun" size={12} color={colors.primary} />
          <Text style={styles.pillText}>Evening</Text>
        </View>
        <Text style={styles.heading}>The Garden Table</Text>
        <Text style={styles.date}>{formattedDate}</Text>
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
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{available}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{booked}</Text>
            <Text style={styles.statLabel}>Reserved</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{TIME_SLOTS.length}</Text>
            <Text style={styles.statLabel}>Total slots</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This evening</Text>
        </View>

        <View style={styles.slotList}>
          {TIME_SLOTS.map((slot) => {
            const reservation = reservations.find((r) => r.timeSlot === slot.key);
            return (
              <TimeSlotCard
                key={slot.key}
                timeSlot={slot.key}
                displayTime={slot.display}
                reservation={reservation}
                onBook={handleBook}
                onCancel={cancelReservation}
              />
            );
          })}

          {available === 0 && !isLoading && (
            <View style={styles.emptyNote}>
              <Feather name="check-circle" size={20} color={colors.accent} />
              <Text style={styles.emptyText}>All slots reserved for this evening</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {selectedSlot && (
        <ReservationSheet
          visible={sheetVisible}
          timeSlot={selectedSlot.key}
          displayTime={selectedSlot.display}
          onConfirm={handleConfirm}
          onClose={() => setSheetVisible(false)}
        />
      )}
    </View>
  );
}
