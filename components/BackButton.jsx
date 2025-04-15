import { StyleSheet, View, Pressable, Text } from "react-native";
import React from "react";
import Icon from "./Icon";
import { theme } from "../constants/themes";
const BackButton = ({ router, size = 26 }) => {
  return (
    <Pressable
      onPress={() => {
        router.back();
      }}
      style={styles.button}
    >
      <Icon name="arrowLeft" size={size} color={theme.colors.text} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "rgba(0,0,0,0.07)",
  },
  text: {
    fontSize: 16,
  },
});

export default BackButton;
