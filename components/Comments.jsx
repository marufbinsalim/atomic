import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import Modal from "react-native-modal";
import { supabase } from "../lib/supabase";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/themes";
import Avatar from "./Avatar";
import { defaultAvatar } from "../constants";
import Loading from "./Loading";

const CommentsDrawer = ({ visible, onClose, postId, user }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*, users (id, name, image)")
      .eq("postId", postId)
      .order("created_at", { ascending: false });

    if (!error) {
      setComments(data);
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    setPostingComment(true);

    const { error } = await supabase.from("comments").insert({
      postId,
      userId: user.id,
      text: commentText,
    });
    console.log(error);

    if (!error) {
      setCommentText("");
      fetchComments(); // reload
    }

    setPostingComment(false);
  };

  useEffect(() => {
    if (visible) fetchComments();
  }, [visible]);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <KeyboardAvoidingView
        style={styles.drawer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.handle} />
        {comments.length === 0 && (
          <Text
            style={{ textAlign: "center", marginTop: hp(2), color: "#aaa" }}
          >
            No comments yet
          </Text>
        )}
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: wp(4) }}
          renderItem={({ item }) => (
            <View style={styles.commentRow}>
              <Avatar
                source={item.users?.image || defaultAvatar}
                size={hp(3)}
              />
              <View style={styles.commentText}>
                <Text style={styles.name}>{item.users?.name}</Text>
                <Text>{item.text}</Text>
              </View>
            </View>
          )}
        />
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Add a comment..."
            value={commentText}
            onChangeText={setCommentText}
            style={styles.input}
          />
          <Pressable onPress={addComment}>
            {!postingComment ? (
              <Text style={styles.sendText}>Send</Text>
            ) : (
              <Loading />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CommentsDrawer;

const styles = StyleSheet.create({
  drawer: {
    height: "70%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  handle: {
    height: 5,
    width: 40,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginVertical: 10,
    borderRadius: 5,
  },
  commentRow: {
    flexDirection: "row",
    gap: wp(2),
    marginBottom: hp(1.5),
  },
  commentText: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    marginBottom: 2,
  },
  inputRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#eee",
    padding: wp(3),
    alignItems: "center",
    gap: wp(2),
  },
  input: {
    flex: 1,
    borderRadius: 20,
    padding: wp(2),
    backgroundColor: "#f0f0f0",
  },
  sendText: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
});
