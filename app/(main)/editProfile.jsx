import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/themes";
import Icon from "../../components/Icon";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import Loading from "../../components/Loading";

export default function EditProfile() {
  const { user, setUserData } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [image, setImage] = useState(user?.image || null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    console.log(user);
    setUsername(user?.name || "");
    setBio(user?.bio || "");
    setImage(user?.image || null);
  }, [user]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      // Read the file as base64
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileExt = file.uri.split(".").pop();
      let dateStr = new Date().toISOString();
      const filePath = `avatars/${user.id}${dateStr}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile")
        .upload(filePath, decode(base64), {
          contentType: file.mimeType,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("profile").getPublicUrl(filePath);
      setImage(data.publicUrl);
      setUserData({
        image: data.publicUrl,
      });
    } catch (error) {
      Alert.alert("Upload error", error.message);
    } finally {
      setUploading(false);
    }
  };

  const saveChanges = async () => {
    const { error } = await supabase
      .from("users")
      .update({
        name: username.trim(),
        bio: bio.trim(),
        image: image,
      })
      .eq("id", user.id);

    setUserData({
      name: username.trim(),
      bio: bio.trim(),
      image: image,
    });

    if (error) {
      Alert.alert("Error updating profile", error.message);
    } else {
      Alert.alert("Success", "Profile updated");
      router.back();
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.push("profile")}>
            <Icon name="arrowLeft" size={hp(4)} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.title}>Edit Profile</Text>
        </View>

        <Pressable style={styles.imageWrapper} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              {uploading ? (
                <Loading />
              ) : (
                <Icon name="camera" size={24} color="#666" />
              )}
            </View>
          )}
        </Pressable>

        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          style={styles.input}
          placeholderTextColor="#999"
        />
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Bio"
          style={[styles.input, { height: hp(10), textAlignVertical: "top" }]}
          placeholderTextColor="#999"
          multiline
        />

        <Pressable style={styles.saveButton} onPress={saveChanges}>
          <Text style={styles.saveText}>Save Changes</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: wp(4),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: wp(5),
    fontWeight: "bold",
    marginLeft: wp(2),
  },
  imageWrapper: {
    alignSelf: "center",
    marginBottom: hp(3),
  },
  image: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
  },
  placeholder: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: wp(2),
    padding: wp(3),
    marginBottom: hp(2),
    fontSize: wp(4),
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    alignItems: "center",
    marginTop: hp(2),
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: wp(4),
  },
});
