import { View, Text } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScreenWrapper({ children, bg = "white" }) {
  const { top } = useSafeAreaInsets();
  const paddingTop = top + 15;
  return (
    <View style={{ flex: 1, paddingTop: paddingTop, backgroundColor: bg }}>
      {children}
    </View>
  );
}
