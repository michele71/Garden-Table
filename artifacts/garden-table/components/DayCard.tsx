import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import type { GardenReservation } from "@workspace/api-client-react";

interface Props {
  date: string; // YYYY-MM-DD
  reservation: GardenReservation | undefined;
  isToday: boolean;
  isPast: boolean;
  onBook: (date: string) => void;
  onCancel: (id: number) => void;
}

function formatDayLabel(dateStr: string): { day: string; dateLabel: string } {
  const d = new Date(dateStr + "T12:00:00");
  return {
    day: d.toLocaleDateString("en-GB", { weekday: "short" }),
    dateLabel: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
  };
}

export function DayCard({ date, reservation, isToday, isPast, onBook, onCancel }: Props) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    if (isPast) return;

    scale.value = withSpring(0.97, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 150 });
    });
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (reservation) {
      onCancel(reservation.id);
    } else {
      onBook(date);
    }
  }, [isPast, reservation, date, onBook, onCancel, scale]);

  const { day, dateLabel } = formatDayLabel(date);

  const isBooked = !!reservation;
  const borderColor = isToday
    ? colors.primary
    : isBooked
      ? colors.accent
      : colors.border;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: isPast ? colors.muted : colors.card,
      borderRadius: colors.radius,
      marginBottom: 10,
      borderWidth: isToday ? 2 : 1,
      borderColor,
      overflow: "hidden",
      opacity: isPast ? 0.55 : 1,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingVertical: 15,
      gap: 14,
    },
    dateBlock: {
      width: 52,
    },
    dayName: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: isToday ? colors.primary : colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    dateNum: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: isToday ? colors.primary : isPast ? colors.mutedForeground : colors.foreground,
      letterSpacing: -0.5,
      lineHeight: 26,
    },
    monthLabel: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    content: {
      flex: 1,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isPast
        ? colors.mutedForeground
        : isBooked
          ? colors.accent
          : colors.primary,
    },
    statusText: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      color: isPast ? colors.mutedForeground : isBooked ? colors.foreground : colors.primary,
    },
    nameText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginTop: 2,
    },
    todayBadge: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      alignSelf: "flex-start",
      marginBottom: 4,
    },
    todayText: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
      letterSpacing: 0.4,
    },
    actionBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isPast
        ? colors.muted
        : isBooked
          ? colors.secondary
          : colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  const [, datePart] = dateLabel.split(" ");
  const dayNum = dateLabel.split(" ")[0];

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={handlePress} style={styles.card} disabled={isPast}>
        <View style={styles.row}>
          <View style={styles.dateBlock}>
            <Text style={styles.dayName}>{day}</Text>
            <Text style={styles.dateNum}>{dayNum}</Text>
            <Text style={styles.monthLabel}>{datePart}</Text>
          </View>

          <View style={styles.content}>
            {isToday && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>TODAY</Text>
              </View>
            )}
            <View style={styles.statusRow}>
              <View style={styles.dot} />
              <Text style={styles.statusText}>
                {isPast ? "Past" : isBooked ? reservation.name : "Available"}
              </Text>
            </View>
            {isBooked && !isPast && (
              <Text style={styles.nameText}>
                {reservation.partySize} {reservation.partySize === 1 ? "guest" : "guests"}
              </Text>
            )}
          </View>

          {!isPast && (
            <View style={styles.actionBtn}>
              <Feather
                name={isBooked ? "x" : "plus"}
                size={16}
                color={isBooked ? colors.primary : colors.mutedForeground}
              />
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
