import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Reservation } from "@/context/ReservationsContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  timeSlot: string;
  displayTime: string;
  reservation: Reservation | undefined;
  onBook: (timeSlot: string) => void;
  onCancel: (id: string) => void;
}

export function TimeSlotCard({ timeSlot, displayTime, reservation, onBook, onCancel }: Props) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSpring(0.97, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 150 });
    });

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (reservation) {
      onCancel(reservation.id);
    } else {
      onBook(timeSlot);
    }
  }, [reservation, timeSlot, onBook, onCancel, scale]);

  const isBooked = !!reservation;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      marginBottom: 12,
      borderWidth: 1.5,
      borderColor: isBooked ? colors.primary : colors.border,
      overflow: "hidden",
    },
    inner: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: isBooked ? colors.primary : colors.accent,
      marginRight: 14,
    },
    timeBlock: {
      flex: 1,
    },
    time: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      letterSpacing: -0.3,
    },
    status: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: isBooked ? colors.primary : colors.mutedForeground,
      marginTop: 2,
    },
    badge: {
      backgroundColor: isBooked ? colors.secondary : colors.muted,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    badgeText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: isBooked ? colors.primary : colors.mutedForeground,
    },
    guestRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingBottom: 14,
      gap: 16,
    },
    guestInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    guestText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 18,
    },
  });

  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable onPress={handlePress} style={styles.card}>
        <View style={styles.inner}>
          <View style={styles.dot} />
          <View style={styles.timeBlock}>
            <Text style={styles.time}>{displayTime}</Text>
            <Text style={styles.status}>
              {isBooked ? reservation.name : "Available"}
            </Text>
          </View>
          <View style={styles.badge}>
            {isBooked ? (
              <Feather name="x" size={13} color={colors.primary} />
            ) : (
              <Feather name="plus" size={13} color={colors.mutedForeground} />
            )}
            <Text style={styles.badgeText}>
              {isBooked ? "Cancel" : "Book"}
            </Text>
          </View>
        </View>

        {isBooked && (
          <>
            <View style={styles.divider} />
            <View style={styles.guestRow}>
              <View style={styles.guestInfo}>
                <Feather name="users" size={13} color={colors.mutedForeground} />
                <Text style={styles.guestText}>
                  {reservation.partySize} {reservation.partySize === 1 ? "guest" : "guests"}
                </Text>
              </View>
              <View style={styles.guestInfo}>
                <Feather name="check-circle" size={13} color={colors.accent} />
                <Text style={styles.guestText}>Reserved</Text>
              </View>
            </View>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}
