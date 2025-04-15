import React from "react";
import { Pressable } from "react-native";
import { Text, View, StyleSheet } from "react-native";
import { theme } from "../constants/themes";
import { hp, wp } from "../helpers/common";
import Loading from "./Loading";
import { useRouter } from "expo-router";
import BackButton from "./BackButton";
const Header = ({ title = "title", showBackButton = false, mb = 10 }) => {
  const router = useRouter();
  return (
    <View style={[styles.header, { marginBottom: mb }]}>
      {showBackButton && (
        <View style={styles.backButton}>
          <BackButton router={router} />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    gap: 10,
  },
  backButton: {
    position: "absolute",
    left: 0,
  },
  title: {
    color: theme.colors.textDark,
    fontSize: hp(3.2),
    fontWeight: "bold",
  },
});

export default Header;
