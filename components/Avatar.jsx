import { StyleSheet, View, Pressable, Text } from "react-native";
import React from "react";
import Icon from "./Icon";
import { theme } from "../constants/themes";
import { hp } from "../helpers/common";
import { Image } from "react-native";
import { defaultAvatar } from "../constants";

const Avatar = ({
  uri = defaultAvatar,
  size = hp(7.2),
  rounded = theme.radius.sm,
  style = {},
}) => {
  return (
    <Image
      source={{ uri: uri || defaultAvatar }}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: rounded },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: theme.colors.gray,
  },
});

export default Avatar;
