import { Stack, useRouter } from "expo-router";
import React from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getUserData } from "../services/userService";

const _layout = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

const MainLayout = () => {
  const { setAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // if the next screen is home, return
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setAuth(session.user);
        updateUserData(session.user);
        router.replace("/home");
      } else {
        console.log("User logged out");
        setAuth(null);
        router.replace("/welcome");
      }
    });
  }, []);

  const updateUserData = async (user) => {
    if (!user) return;
    let { result, error } = await getUserData(user.id);
    console.log(result, error);
    setAuth((prev) => ({ ...prev, ...result, email: user?.email }));
  };

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
};

export default _layout;
