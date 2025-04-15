import React from "react";
import { TextInput } from "react-native";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import { theme } from "../constants/themes";
import { hp } from "../helpers/common";

const Input = (props) => {
  return (
    <View
      style={[styles.container, props.containerStyles && props.containerStyles]}
    >
      {props.icon && props.icon}
      <TextInput
        style={{ flex: 1 }}
        placeholderTextColor={theme.colors.textLight}
        ref={props.inputRef && props.inputRef}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: hp(7.2),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.4,
    borderColor: theme.colors.textLight,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 18,
    gap: 12,
    borderCurve: "continuous",
  },
});

export default Input;
