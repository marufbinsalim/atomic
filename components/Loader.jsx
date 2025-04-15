import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { Loader } from "lucide-react-native";

const SpinningIcon = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Loader size={18} color="black" />
    </Animated.View>
  );
};

export default SpinningIcon;
