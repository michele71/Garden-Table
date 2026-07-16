import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  timeSlot: string;
  displayTime: string;
  onConfirm: (name: string, partySize: number) => void;
  onClose: () => void;
}

export function ReservationSheet({ visible, timeSlot, displayTime, onConfirm, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [nameError, setNameError] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const nameRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setName("");
      setPartySize(2);
      setNameError(false);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 200 }),
      ]).start(() => {
        setTimeout(() => nameRef.current?.focus(), 100);
      });
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleConfirm = useCallback(() => {
    if (!name.trim()) {
      setNameError(true);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Keyboard.dismiss();
    onConfirm(name.trim(), partySize);
  }, [name, partySize, onConfirm]);

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
    slotTag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.secondary,
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 24,
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
      marginBottom: 24,
      letterSpacing: -0.5,
    },
    label: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderColor: nameError ? colors.destructive : colors.input,
      borderRadius: colors.radius,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      fontFamily: "Inter_400Regular",
      color: colors.foreground,
      marginBottom: 4,
    },
    errorText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.destructive,
      marginBottom: 20,
    },
    inputValid: { marginBottom: 24 },
    partyRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 32,
    },
    partyControls: { flexDirection: "row", alignItems: "center", gap: 20 },
    partyBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    partyCount: {
      fontSize: 22,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      minWidth: 28,
      textAlign: "center",
    },
    confirmBtn: {
      backgroundColor: colors.primary,
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
      color: colors.primaryForeground,
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
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
          <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>

            <View style={styles.handle} />

            <View style={styles.slotTag}>
              <Feather name="clock" size={14} color={colors.primary} />
              <Text style={styles.slotTagText}>{displayTime}</Text>
            </View>

            <Text style={styles.title}>Reserve the table</Text>

            <Text style={styles.label}>Your name</Text>
            <TextInput
              ref={nameRef}
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={(t) => { setName(t); setNameError(false); }}
              returnKeyType="done"
              onSubmitEditing={handleConfirm}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {nameError ? (
              <Text style={styles.errorText}>Please enter your name</Text>
            ) : (
              <View style={styles.inputValid} />
            )}

            <Text style={styles.label}>Party size</Text>
            <View style={styles.partyRow}>
              <View style={styles.partyControls}>
                <Pressable style={styles.partyBtn} onPress={() => adjustParty(-1)}>
                  <Feather name="minus" size={18} color={colors.primary} />
                </Pressable>
                <Text style={styles.partyCount}>{partySize}</Text>
                <Pressable style={styles.partyBtn} onPress={() => adjustParty(1)}>
                  <Feather name="plus" size={18} color={colors.primary} />
                </Pressable>
              </View>
            </View>

            <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
              <Feather name="check" size={18} color={colors.primaryForeground} />
              <Text style={styles.confirmText}>Confirm reservation</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
