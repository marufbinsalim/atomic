import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/themes";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import Icon from "../../components/Icon";
import { Video } from "expo-av";
import { supabase } from "../../lib/supabase";
import Loading from "../../components/Loading";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

export default function NewPost() {
  const { user } = useAuth();
  const router = useRouter();
  const [postContent, setPostContent] = useState("");
  const [assets, setAssets] = useState([]);
  const [postUploading, setPostUploading] = useState(false);

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "We need media permissions to upload files.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const selected = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type, // 'image' or 'video'
        fileName: asset.uri.split("/").pop(),
        mimeType: asset.mimeType,
      }));
      setAssets((prev) => [...prev, ...selected]);
    }
  };

  const uploadFileToStorage = async (file) => {
    try {
      // Read the file as base64
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Generate a unique filename
      const fileExt = file.fileName.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("posts") // Your bucket name
        .upload(filePath, decode(base64), {
          contentType: file.mimeType,
        });

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("posts").getPublicUrl(filePath);

      return {
        url: publicUrl,
        type: file.type,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const handlePost = async () => {
    if (!postContent.trim() && assets.length === 0) {
      Alert.alert(
        "Empty Post",
        "Please add some content or media to your post",
      );
      return;
    }

    setPostUploading(true);

    try {
      // Upload all assets first
      const uploadedAssets = [];
      for (const asset of assets) {
        const uploaded = await uploadFileToStorage(asset);
        uploadedAssets.push(uploaded);
      }

      // Create the post with the asset URLs
      const { error: uploadError } = await supabase.from("posts").insert([
        {
          userId: user.id,
          body: postContent,
          file: uploadedAssets,
        },
      ]);

      if (uploadError) {
        console.error("Post creation error:", uploadError);
        Alert.alert("Error", "Failed to create post");
        return;
      }

      // Reset form
      setPostContent("");
      setAssets([]);
      router.push("home");
      Alert.alert("Success", "Your post has been created!");
    } catch (error) {
      console.error("Error in handlePost:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setPostUploading(false);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <ScrollView style={styles.wrapper} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.push("home")}>
            <Icon name="arrowLeft" size={hp(4)} color={theme.colors.text} />
          </Pressable>
        </View>

        <View style={styles.container}>
          <Text style={styles.title}>Create a Post</Text>

          <TextInput
            placeholder="What's on your mind? write something..."
            style={assets.length > 0 ? styles.input : styles.fullInput}
            multiline
            numberOfLines={assets.length > 0 ? 20 : 40}
            value={postContent}
            onChangeText={setPostContent}
          />

          {assets.length > 0 && (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={true}
              style={styles.mediaSlider}
            >
              {assets.map((asset, index) => (
                <View key={index} style={styles.mediaWrapper}>
                  <Pressable
                    style={styles.removeButton}
                    onPress={() =>
                      setAssets((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </Pressable>

                  {asset.type === "video" ? (
                    <Video
                      source={{ uri: asset.uri }}
                      rate={1.0}
                      volume={1.0}
                      isMuted={false}
                      resizeMode="cover"
                      shouldPlay={false}
                      isLooping={false}
                      useNativeControls
                      style={styles.media}
                    />
                  ) : (
                    <Image source={{ uri: asset.uri }} style={styles.media} />
                  )}
                </View>
              ))}
            </ScrollView>
          )}

          <Pressable
            style={[
              styles.button,
              {
                width: "max-content",
                maxWidth: "40",
                marginLeft: "auto",
                backgroundColor: "transparent",
              },
            ]}
            onPress={pickMedia}
          >
            <Icon name="images" size={hp(3)} color={theme.colors.text} />
          </Pressable>

          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: theme.colors.primary,
                flexDirection: "row",
                justifyContent: "center",
                gap: 5,
              },
            ]}
            onPress={handlePost}
            disabled={postUploading}
          >
            <Text
              style={[
                styles.buttonText,
                { color: "#fff", width: "max-content" },
              ]}
            >
              Post
            </Text>
            {postUploading && <Loading color="white" size="small" />}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(1.5),
  },
  container: {
    flex: 1,
    paddingBottom: hp(5),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(2.5),
    fontWeight: "600",
    marginBottom: hp(2),
  },
  input: {
    backgroundColor: theme.colors.lightGray,
    padding: wp(3),
    borderRadius: theme.radius.md,
    fontSize: hp(2),
    height: hp(36),
    minHeight: hp(36),
    maxHeight: hp(36),
    textAlignVertical: "top",
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: "#ccc",
  },
  fullInput: {
    backgroundColor: theme.colors.lightGray,
    padding: wp(3),
    borderRadius: theme.radius.md,
    fontSize: hp(2),
    minHeight: hp(66),
    maxHeight: hp(66),
    textAlignVertical: "top",
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: "#ccc",
  },
  mediaSlider: {
    marginBottom: hp(2),
    height: hp(30),
  },
  mediaWrapper: {
    width: width - wp(12), // full width minus padding
    height: hp(30),
    position: "relative",
    marginLeft: wp(2),
    marginRight: wp(2),
  },
  media: {
    width: "100%",
    height: "100%",
    borderRadius: theme.radius.sm,
  },
  removeButton: {
    position: "absolute",
    top: hp(1),
    right: wp(2),
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 10,
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: hp(2.5),
  },
  button: {
    backgroundColor: theme.colors.gray,
    paddingVertical: hp(1.5),
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  buttonText: {
    fontSize: hp(2),
    fontWeight: "600",
  },
});
