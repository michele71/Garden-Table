import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import type { GardenReservation } from "@workspace/api-client-react";

interface Props {
  date: string;
  reservation: GardenReservation | undefined;
  isToday: boolean;
  isPast: boolean;
  onBook: (date: string) => void;
  onCancel: (id: number) => void;
}

function formatDayLabel(dateStr: string): { day: string; dayNum: string; month: string } {
  const d = new Date(dateStr + "T12:00:00");
  const full = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const [dayNum, month] = full.split(" ");
  return {
    day: d.toLocaleDateString("en-GB", { weekday: "short" }),
    dayNum,
    month,
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

  const { day, dayNum, month } = formatDayLabel(date);
  const isBooked = !!reservation;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: isPast
        ? colors.muted
        : isBooked
          ? colors.accent + "12"
          : colors.card,
      borderRadius: colors.radius,
      marginBottom: 10,
      borderWidth: isToday ? 2 : 1,
      borderColor: isToday
        ? colors.primary
        : isBooked
          ? colors.accent + "55"
          : colors.border,
      overflow: "hidden",
      opacity: isPast ? 0.5 : 1,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingVertical: 14,
      gap: 14,
    },
    dateBlock: {
      width: 50,
    },
    dayName: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: isToday ? colors.primary : colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    dateNum: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: isToday
        ? colors.primary
        : isPast
          ? colors.mutedForeground
          : colors.foreground,
      letterSpacing: -0.5,
      lineHeight: 28,
    },
    monthLabel: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    content: {
      flex: 1,
      gap: 4,
    },
    todayBadge: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      alignSelf: "flex-start",
    },
    todayText: {
      fontSize: 10,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
      letterSpacing: 0.6,
    },
    flatBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.accent + "22",
      borderRadius: 8,
      paddingHorizontal: 9,
      paddingVertical: 4,
      alignSelf: "flex-start",
    },
    flatBadgeText: {
      fontSize: 14,
      fontFamily: "Inter_700Bold",
      color: colors.accent,
      letterSpacing: -0.2,
    },
    guestRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    guestText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: isPast
        ? colors.mutedForeground
        : colors.primary,
    },
    statusText: {
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: isPast ? colors.mutedForeground : colors.primary,
    },
    actionBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isPast
        ? colors.muted
        : isBooked
          ? colors.accent + "22"
          : colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <Animated.View style={animatedStyle}>
      <Pressable onPress={handlePress} style={styles.card} disabled={isPast}>
        <View style={styles.row}>
          <View style={styles.dateBlock}>
            <Text style={styles.dayName}>{day}</Text>
            <Text style={styles.dateNum}>{dayNum}</Text>
            <Text style={styles.monthLabel}>{month}</Text>
          </View>

          <View style={styles.content}>
            {isToday && !isBooked && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>TODAY</Text>
              </View>
            )}

            {isBooked && !isPast ? (
              <>
                <View style={styles.flatBadge}>
                  <Feather name="home" size={12} color={colors.accent} />
                  <Text style={styles.flatBadgeText}>{reservation.name}</Text>
                  {isToday && (
                    <Text style={[styles.flatBadgeText, { fontSize: 10, opacity: 0.7 }]}>
                      {" · Today"}
                    </Text>
                  )}
                </View>
                <View style={styles.guestRow}>
                  <Feather name="users" size={11} color={colors.mutedForeground} />
                  <Text style={styles.guestText}>
                    {reservation.partySize} {reservation.partySize === 1 ? "guest" : "guests"}
                  </Text>
                  <Text style={styles.guestText}> · </Text>
                  <Feather
                    name={reservation.isPrivate ? "lock" : "users"}
                    size={11}
                    color={reservation.isPrivate ? colors.mutedForeground : colors.accent}
                  />
                  <Text
                    style={[
                      styles.guestText,
                      !reservation.isPrivate && { color: colors.accent },
                    ]}
                  >
                    {reservation.isPrivate ? "Private" : "Open"}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.statusRow}>
                <View style={styles.dot} />
                <Text style={styles.statusText}>
                  {isPast ? "Past" : "Available"}
                </Text>
              </View>
            )}
          </View>

          {!isPast && (
            <View style={styles.actionBtn}>
              <Feather
                name={isBooked ? "x" : "plus"}
                size={16}
                color={isBooked ? colors.accent : colors.mutedForeground}
              />
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
