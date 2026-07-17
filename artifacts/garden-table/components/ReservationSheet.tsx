import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const FLATS = ["Flat 1", "Flat 2", "Flat 3", "Flat 4", "Flat 5", "Flat 6", "Flat 7"];

interface Props {
  visible: boolean;
  timeSlot: string;
  displayTime: string;
  onConfirm: (name: string, partySize: number, isPrivate: boolean) => void;
  onClose: () => void;
}

export function ReservationSheet({ visible, timeSlot, displayTime, onConfirm, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedFlat, setSelectedFlat] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [isPrivate, setIsPrivate] = useState(false);
  const [flatError, setFlatError] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setSelectedFlat(null);
      setPartySize(2);
      setIsPrivate(false);
      setFlatError(false);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleSelectFlat = useCallback((flat: string) => {
    setSelectedFlat(flat);
    setFlatError(false);
    if (Platform.OS !== "web") Haptics.selectionAsync();
  }, []);

  const handleTogglePrivacy = useCallback((value: boolean) => {
    setIsPrivate(value);
    if (Platform.OS !== "web") Haptics.selectionAsync();
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedFlat) {
      setFlatError(true);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm(selectedFlat, partySize, isPrivate);
  }, [selectedFlat, partySize, isPrivate, onConfirm]);

  const adjustParty = useCallback((delta: number) => {
    setPartySize((prev) => Math.max(1, Math.min(8, prev + delta)));
    if (Platform.OS !== "web") Haptics.selectionAsync();
  }, []);

  const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: insets.bottom + 20,
    },
    handle: {
      width: 38,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: 20,
    },
    closeBtn: {
      position: "absolute",
      top: 12,
      right: 20,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    slotTag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.secondary,
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 20,
    },
    slotTagText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
    title: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 6,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      marginBottom: 24,
    },
    label: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    flatsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 8,
    },
    flatBtn: {
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 12,
      borderWidth: 1.5,
      minWidth: 80,
      alignItems: "center",
    },
    flatBtnSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    flatBtnUnselected: {
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    flatBtnError: {
      borderColor: colors.destructive,
    },
    flatBtnText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    flatBtnTextSelected: {
      color: colors.primaryForeground,
    },
    flatBtnTextUnselected: {
      color: colors.foreground,
    },
    errorText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.destructive,
      marginBottom: 20,
    },
    spacer: { marginBottom: 24 },
    partyLabel: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    partyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 20,
      marginBottom: 24,
    },
    partyBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    partyCount: {
      fontSize: 24,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      minWidth: 32,
      textAlign: "center",
    },
    partyUnit: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    privacyLabel: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    privacyToggle: {
      flexDirection: "row",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      marginBottom: 28,
    },
    privacyOption: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      paddingVertical: 12,
    },
    privacyOptionActive: {
      backgroundColor: colors.primary,
    },
    privacyOptionInactive: {
      backgroundColor: colors.background,
    },
    privacyOptionText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    privacyOptionTextActive: {
      color: colors.primaryForeground,
    },
    privacyOptionTextInactive: {
      color: colors.mutedForeground,
    },
    confirmBtn: {
      backgroundColor: selectedFlat ? colors.primary : colors.muted,
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    confirmText: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: selectedFlat ? colors.primaryForeground : colors.mutedForeground,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </Pressable>

          <View style={styles.handle} />

          <View style={styles.slotTag}>
            <Feather name="calendar" size={14} color={colors.primary} />
            <Text style={styles.slotTagText}>{displayTime}</Text>
          </View>

          <Text style={styles.title}>Reserve the table</Text>
          <Text style={styles.subtitle}>Select your flat to confirm the booking</Text>

          <Text style={styles.label}>Your flat</Text>
          <View style={styles.flatsGrid}>
            {FLATS.map((flat) => {
              const isSelected = selectedFlat === flat;
              return (
                <Pressable
                  key={flat}
                  style={[
                    styles.flatBtn,
                    isSelected ? styles.flatBtnSelected : styles.flatBtnUnselected,
                    flatError && !isSelected && styles.flatBtnError,
                  ]}
                  onPress={() => handleSelectFlat(flat)}
                >
                  <Text
                    style={[
                      styles.flatBtnText,
                      isSelected ? styles.flatBtnTextSelected : styles.flatBtnTextUnselected,
                    ]}
                  >
                    {flat}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {flatError ? (
            <Text style={styles.errorText}>Please select your flat</Text>
          ) : (
            <View style={styles.spacer} />
          )}

          <Text style={styles.partyLabel}>Party size</Text>
          <View style={styles.partyRow}>
            <Pressable style={styles.partyBtn} onPress={() => adjustParty(-1)}>
              <Feather name="minus" size={18} color={colors.primary} />
            </Pressable>
            <Text style={styles.partyCount}>{partySize}</Text>
            <Pressable style={styles.partyBtn} onPress={() => adjustParty(1)}>
              <Feather name="plus" size={18} color={colors.primary} />
            </Pressable>
            <Text style={styles.partyUnit}>
              {partySize === 1 ? "guest" : "guests"}
            </Text>
          </View>

          <Text style={styles.privacyLabel}>Table access</Text>
          <View style={styles.privacyToggle}>
            <Pressable
              style={[
                styles.privacyOption,
                !isPrivate ? styles.privacyOptionActive : styles.privacyOptionInactive,
              ]}
              onPress={() => handleTogglePrivacy(false)}
            >
              <Feather
                name="users"
                size={15}
                color={!isPrivate ? colors.primaryForeground : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.privacyOptionText,
                  !isPrivate ? styles.privacyOptionTextActive : styles.privacyOptionTextInactive,
                ]}
              >
                Open
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.privacyOption,
                isPrivate ? styles.privacyOptionActive : styles.privacyOptionInactive,
              ]}
              onPress={() => handleTogglePrivacy(true)}
            >
              <Feather
                name="lock"
                size={15}
                color={isPrivate ? colors.primaryForeground : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.privacyOptionText,
                  isPrivate ? styles.privacyOptionTextActive : styles.privacyOptionTextInactive,
                ]}
              >
                Private
              </Text>
            </Pressable>
          </View>

          <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
            <Feather
              name="check"
              size={18}
              color={selectedFlat ? colors.primaryForeground : colors.mutedForeground}
            />
            <Text style={styles.confirmText}>
              {selectedFlat ? `Book for ${selectedFlat}` : "Select a flat to continue"}
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
