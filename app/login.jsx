import { StyleSheet, Text, View } from "react-native";
import React, { useRef } from "react";
import { useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import Icon from "../components/Icon";
import BackButton from "../components/BackButton";
import Input from "../components/Input";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { theme } from "@/constants/themes";
import { wp, hp } from "@/helpers/common";
import Button from "../components/Button";
import {
  GestureHandlerRootView,
  Pressable,
} from "react-native-gesture-handler";
import { supabase } from "../lib/supabase";

export default function Login() {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      alert("Please fill all fields");
      return;
    }
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);
    // login logic here
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Something went wrong. Please try again", error.message);
      return;
    }
  };

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />
        <View>
          <Text style={styles.welcomeText}>Hey, </Text>
          <Text style={styles.welcomeText}>Welcome back</Text>
        </View>
        <View style={styles.form}>
          <Text style={{ fontSize: hp(2.2), color: theme.colors.text }}>
            Please Login to continue
          </Text>
          {/* form */}
          <Input
            placeholder="Enter your email"
            icon={<Icon name="mail" size={20} color={theme.colors.text} />}
            onChangeText={(text) => (emailRef.current = text)}
          />
          <Input
            placeholder="Enter your password"
            icon={<Icon name="lock" size={20} color={theme.colors.text} />}
            onChangeText={(text) => (passwordRef.current = text)}
            secureTextEntry
          />
          <Text style={styles.forgotPassword}>Forgot password?</Text>
          <Button title="Login" onPress={onSubmit} loading={loading} />

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

            <GestureHandlerRootView style={{ flexDirection: "row", gap: 5 }}>
              <Pressable onPress={() => router.push("signup")}>
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
              <Pressable onPress={() => router.push("home")}>
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
            </GestureHandlerRootView>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.font.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  forgotPassword: {
    fontSize: hp(2.2),
    color: theme.colors.primary,
    textAlign: "right",
  },
  bottomContainer: {
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});
