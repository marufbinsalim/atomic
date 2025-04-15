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

export default function Signup() {
  const router = useRouter();
  const nameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current || !nameRef.current) {
      alert("Please fill all fields");
      return;
    }
    let name = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    console.log(data, error);
    const session = data.session;
    if (error) {
      alert("Something went wrong. Please try again", error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} />
        <View>
          <Text style={styles.welcomeText}>Let's</Text>
          <Text style={styles.welcomeText}>Get Started</Text>
        </View>
        <View style={styles.form}>
          <Text style={{ fontSize: hp(2.2), color: theme.colors.text }}>
            Please fill the form to create an account
          </Text>
          {/* form */}
          <Input
            placeholder="Enter your name"
            icon={<Icon name="user" size={20} color={theme.colors.text} />}
            onChangeText={(text) => (nameRef.current = text)}
          />
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
          <Button title="Sign Up" onPress={onSubmit} loading={loading} />

          <View style={styles.bottomContainer}>
            <Text
              style={{
                fontSize: hp(2.2),
                color: theme.colors.text,
                textAlign: "center",
              }}
            >
              Already have an account?
            </Text>

            <GestureHandlerRootView style={{ flexDirection: "row", gap: 5 }}>
              <Pressable onPress={() => router.push("login")}>
                <Text
                  style={{
                    fontSize: hp(2.3),
                    textDecorationLine: "underline",
                    color: theme.colors.primary,
                    fontWeight: theme.font.bold,
                  }}
                >
                  Login
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
