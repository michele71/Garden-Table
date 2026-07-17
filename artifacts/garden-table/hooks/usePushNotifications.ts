import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";

import { useRegisterGardenToken } from "@workspace/api-client-react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications(flat: string | null) {
  const { mutate: registerToken } = useRegisterGardenToken();
  const registeredFor = useRef<string | null>(null);

  const register = useCallback(
    async (targetFlat: string) => {
      if (Platform.OS === "web") return;
      if (!Device.isDevice) return;
      if (registeredFor.current === targetFlat) return;

      try {
        type Perms = { granted: boolean };
        const existing = (await Notifications.getPermissionsAsync()) as unknown as Perms;
        let granted = existing.granted;

        if (!granted) {
          const asked = (await Notifications.requestPermissionsAsync()) as unknown as Perms;
          granted = asked.granted;
        }

        if (!granted) return;

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("garden", {
            name: "Garden bookings",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
          });
        }

        const tokenData = await Notifications.getExpoPushTokenAsync();
        registeredFor.current = targetFlat;
        registerToken({ data: { flat: targetFlat, token: tokenData.data } });
      } catch {
        // Silently ignore — notifications are best-effort
      }
    },
    [registerToken]
  );

  useEffect(() => {
    if (flat) register(flat);
  }, [flat, register]);
}
