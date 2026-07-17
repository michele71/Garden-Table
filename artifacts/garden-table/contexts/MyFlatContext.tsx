import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";

import { useListGardenReservations } from "@workspace/api-client-react";

import { usePushNotifications } from "@/hooks/usePushNotifications";

const MY_FLAT_KEY = "garden_my_flat";

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

interface MyFlatContextValue {
  myFlat: string | null;
  flatLoaded: boolean;
  myBookingsCount: number;
  selectFlat: (flat: string) => void;
}

const MyFlatContext = createContext<MyFlatContextValue>({
  myFlat: null,
  flatLoaded: false,
  myBookingsCount: 0,
  selectFlat: () => {},
});

export function MyFlatProvider({ children }: { children: React.ReactNode }) {
  const [myFlat, setMyFlat] = useState<string | null>(null);
  const [flatLoaded, setFlatLoaded] = useState(false);

  const weekStart = useMemo(() => getWeekMonday(), []);

  useEffect(() => {
    AsyncStorage.getItem(MY_FLAT_KEY).then((val) => {
      if (val) setMyFlat(val);
      setFlatLoaded(true);
    });
  }, []);

  const selectFlat = useCallback(async (flat: string) => {
    setMyFlat(flat);
    await AsyncStorage.setItem(MY_FLAT_KEY, flat);
    if (Platform.OS !== "web") Haptics.selectionAsync();
  }, []);

  usePushNotifications(myFlat);

  const { data: reservations = [] } = useListGardenReservations({ weekStart });

  const myBookingsCount = useMemo(
    () => (myFlat ? reservations.filter((r) => r.name === myFlat).length : 0),
    [reservations, myFlat]
  );

  const value = useMemo(
    () => ({ myFlat, flatLoaded, myBookingsCount, selectFlat }),
    [myFlat, flatLoaded, myBookingsCount, selectFlat]
  );

  return <MyFlatContext.Provider value={value}>{children}</MyFlatContext.Provider>;
}

export function useMyFlat() {
  return useContext(MyFlatContext);
}
