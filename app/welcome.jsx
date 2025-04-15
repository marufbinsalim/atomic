import { Text, View, StyleSheet } from "react-native";
import React from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { StatusBar } from "react-native";
import { hp, wp } from "../helpers/common";
import { Image } from "react-native";
import { theme } from "../constants/themes";
import Button from "../components/Button";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";

const Welcome = () => {
  const router = useRouter();

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* welcome image */}
        <Image
          style={styles.welcomeImage}
          resizeMode="contain"
          source={require("../assets/images/logo.jpeg")}
        />
        {/* title */}
        <View style={{ gap: 10 }}>
          <Text style={styles.title}>Atomic</Text>
          <Text style={styles.punchline}>
            A social media platform, where free speech prevails.
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            title="Log in to your account"
            onPress={() => router.push("login")}
          />
          <View style={styles.bottomContainer}>
            <Text
              style={{
                fontSize: hp(2.2),
                color: theme.colors.text,
                textAlign: "center",
              }}
            >
              Don't have an account?
            </Text>

            <View style={{ flexDirection: "row", gap: 5 }}>
              <Pressable
                onPress={() => {
                  router.push("signup");
                }}
              >
                <Text
                  style={{
                    fontSize: hp(2.3),
                    textDecorationLine: "underline",
                    color: theme.colors.primary,
                    fontWeight: theme.font.bold,
                  }}
                >
                  Sign up
                </Text>
              </Pressable>
              <Text style={{ fontSize: hp(2.2), color: theme.colors.text }}>
                Or
              </Text>
              <Pressable onPress={() => router.push("/home")}>
                <Text
                  style={{
                    fontSize: hp(2.3),
                    textDecorationLine: "underline",
                    color: theme.colors.primary,
                    fontWeight: theme.font.bold,
                  }}
                >
                  Continue as guest
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "white",
    paddingHorizontal: wp(8),
  },
  welcomeImage: {
    height: hp(30),
    width: wp(100),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(8),
    textAlign: "center",
    fontWeight: theme.font.bold,
  },
  punchline: {
    color: theme.colors.text,
    fontSize: hp(2.5),
    textAlign: "center",
  },

  footer: {
    width: "100%",
    gap: 30,
  },

  bottomContainer: {
    flexDirection: "col",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
});
export default Welcome;
