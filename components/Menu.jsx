import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import React from "react";
import Modal from "react-native-modal";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/themes";
import Icon from "./Icon";

const MenuDrawer = ({
  visible,
  onClose,
  onCreatePost,
  onCreateStory,
  onGoLive,
}) => {
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

        <Pressable style={styles.option} onPress={onCreatePost}>
          <Icon name="plus" size={hp(3)} color={theme.colors.primary} />
          <Text style={styles.optionText}>Create New Post</Text>
        </Pressable>

        <Pressable style={styles.option} onPress={onCreateStory}>
          <Icon name="camera" size={hp(3)} color={theme.colors.primary} />
          <Text style={styles.optionText}>Create a Story</Text>
        </Pressable>

        <Pressable style={styles.option} onPress={onGoLive}>
          <Icon name="live" size={hp(3)} color={theme.colors.primary} />
          <Text style={styles.optionText}>Go Live</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default MenuDrawer;

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: hp(3),
    paddingHorizontal: wp(5),
  },
  handle: {
    height: 5,
    width: 40,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginBottom: hp(2),
    borderRadius: 5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: hp(2),
    fontWeight: "400",
  },
});
