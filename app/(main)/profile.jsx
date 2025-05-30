import {
  View,
  Text,
  StyleSheet,
  Alert,
  FlatList,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Button } from "react-native";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/themes";
import { Pressable } from "react-native";
import Icon from "../../components/Icon";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import Avatar from "../../components/Avatar";
import Loading from "../../components/Loading";
import { defaultAvatar } from "../../constants";
import { Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";

const screenWidth = Dimensions.get("window").width;

const RenderFilePreview = ({ files, isRepost = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef();

  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / wp(41.5));
    setCurrentIndex(index);
  };

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={
          isRepost ? styles.repostPreviewContainer : styles.previewContainer
        }
      >
        {files.map((file, index) =>
          file.type === "image" ? (
            <Image
              key={index}
              source={{ uri: file.url }}
              style={true ? styles.repostPreviewImage : styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <View key={index} style={{ position: "relative" }}>
              <Video
                key={index}
                source={{
                  uri: file.url,
                }}
                useNativeControls={false}
                resizeMode="cover"
                isMuted={false}
                shouldPlay={false}
                style={true ? styles.repostPreviewImage : styles.previewImage}
              />
              <Icon
                name="play"
                size={hp(4)}
                color="white"
                fill="#ff000080"
                style={{
                  position: "absolute",
                  top: "30%",
                  left: "40%",
                  zIndex: 10,
                }}
              />
            </View>
          ),
        )}
      </ScrollView>
      {files.length > 1 && (
        <View style={styles.dotsContainer}>
          {files.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const UserHeader = ({
  user,
  router,
  posts,
  followersCount,
  followingCount,
  type,
  isLoading,
}) => {
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error logging out", error.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: logout,
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topHeader}>
        <View style={styles.leftContainer}>
          <Pressable onPress={() => router.push("home")}>
            <Icon name="arrowLeft" size={hp(4)} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.username}>{user?.name || "Profile"}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Icon name="logout" size={hp(3.5)} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Avatar
            size={hp(10)}
            uri={user?.image || defaultAvatar}
            style={styles.avatar}
          />
        </View>
        <View style={styles.actionButtons}>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push("editProfile")}
          >
            <Text style={styles.actionButtonText}>Edit profile</Text>
            <Icon name="edit" size={hp(2)} color="#fff" />
          </Pressable>
        </View>
      </View>

      <View style={styles.bioSection}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.link}>{user?.bio || "No bio yet"}</Text>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>
            {type === "my_posts" ? "posts" : "reposts"}
          </Text>
          <Text style={styles.statNumber}>
            {isLoading ? "..." : posts.length || 0}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>followers</Text>
          <Text style={styles.statNumber}>{followersCount}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>following</Text>
          <Text style={styles.statNumber}>{followingCount}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Likes</Text>
          <Text style={styles.statNumber}>3</Text>
        </View>
      </View>
    </View>
  );
};

const PostPreview = ({ post, isRepost = false }) => {
  const files = isRepost
    ? JSON.parse(post.posts?.file || "[]")
    : JSON.parse(post.file || "[]");

  return (
    <View style={[styles.postPreview, isRepost && styles.repostPreview]}>
      {isRepost && (
        <View style={styles.repostHeader}>
          <Icon name="repeat" size={hp(2.5)} color={theme.colors.textLight} />
          <Text style={styles.repostText}>
            You reposted
            {post.body ? " with caption" : ""}
          </Text>
        </View>
      )}

      <View style={styles.previewHeader}>
        <Avatar
          uri={`${
            isRepost
              ? post.posts?.users?.image || defaultAvatar
              : post.users?.image || defaultAvatar
          }`}
          size={hp(4)}
          style={styles.previewAvatar}
        />
        <Text style={styles.previewUsername}>
          {isRepost ? post.posts?.users?.name : post.users?.name}
        </Text>
      </View>

      {(post.body || post.posts?.body) && (
        <Text style={styles.previewBody} numberOfLines={2} ellipsizeMode="tail">
          {isRepost ? post.posts?.body : post.body}
        </Text>
      )}

      {files.length > 0 && (
        <RenderFilePreview files={files} isRepost={isRepost} />
      )}

      <View style={styles.previewStats}>
        <View style={styles.postStatItem}>
          <Icon name="thumbsup" size={hp(2.2)} color="#6c757d" />
          <Text style={styles.statText}>{post.postLikes?.length || 0}</Text>
        </View>
        <View style={styles.postStatItem}>
          <Icon name="MessageSquare" size={hp(2.2)} color="#6c757d" />
          <Text style={styles.statText}>{post.comments.length || 0}</Text>
        </View>
      </View>
    </View>
  );
};

export default Profile = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const [type, setType] = React.useState("my_posts");
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [followingCount, setFollowingCount] = React.useState(0);
  const [followersCount, setFollowersCount] = React.useState(0);

  useEffect(() => {
    async function fetchMyPosts() {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, users (id, name, image), postLikes (id, userId), posts:original_post(*, users (id, name, image)), comments (id, userId)",
        )
        .match({ userId: user.id, type: "normal" })
        .order("created_at", { ascending: false });

      if (error) {
        return;
      }
      setPosts(data);
      setLoading(false);
    }

    async function fetchMyReposts() {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, users (id, name, image), postLikes (id, userId), posts:original_post(*, users (id, name, image)), comments (id, userId)",
        )
        .match({ userId: user.id, type: "repost" })
        .order("created_at", { ascending: false });

      if (error) {
        return;
      }
      setPosts(data);
      setLoading(false);
    }

    if (user && type === "my_posts") {
      fetchMyPosts();
    } else if (user && type === "reposts") {
      fetchMyReposts();
    }
  }, [user, type]);

  useEffect(() => {
    async function fetchUserData() {
      console.log("Fetching user data...for", user.id);
      let { data, error } = await supabase
        .from("userFollows")
        .select("*")
        .eq("followed", user.id);
      if (error) {
        console.log("Error fetching user data:", error);
        return;
      } else {
        setFollowersCount(data.length);
      }
      const { data: followingData, error: followingError } = await supabase
        .from("userFollows")
        .select("*")
        .eq("followed_by", user.id);

      if (followingError) {
        console.log("Error fetching following data:", followingError);
        return;
      }
      setFollowingCount(followingData.length);
    }
    if (user) fetchUserData();
  }, [user]);

  return (
    <ScreenWrapper>
      <UserHeader
        user={user}
        router={router}
        posts={posts}
        followersCount={followersCount}
        followingCount={followingCount}
        type={type}
        isLoading={loading}
      />

      <View style={styles.contentContainer}>
        <View style={styles.tabContainer}>
          <Pressable
            onPress={() => setType("my_posts")}
            style={[
              styles.tabButton,
              type === "my_posts" && styles.activeTabButton,
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                type === "my_posts" && styles.activeTabButtonText,
              ]}
            >
              My Posts
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setType("reposts")}
            style={[
              styles.tabButton,
              type === "reposts" && styles.activeTabButton,
            ]}
          >
            <Text
              style={[
                styles.tabButtonText,
                type === "reposts" && styles.activeTabButtonText,
              ]}
            >
              Reposts
            </Text>
          </Pressable>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <Loading size="large" color={theme.colors.primary} />
          </View>
        )}

        {!loading && posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="camera" size={hp(8)} color={"#dbdbdb"} />
            <Text style={styles.emptyStateText}>
              {type === "my_posts"
                ? "You haven't posted anything yet"
                : "You haven't reposted anything yet"}
            </Text>
            <Pressable
              style={styles.createPostButton}
              onPress={() => router.push("newPost")}
            >
              <Text style={styles.createPostButtonText}>
                Create your first {type === "my_posts" ? "post" : "post"}
              </Text>
              <Icon name="plus" size={hp(3)} color="#fff" />
            </Pressable>
          </View>
        ) : !loading ? (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.gridContainer}
            renderItem={({ item }) => (
              <PostPreview post={item} isRepost={item.type === "repost"} />
            )}
            contentContainerStyle={styles.postsList}
          />
        ) : null}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    padding: wp(4),
    backgroundColor: "white",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(2),
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(4),
  },
  username: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    marginRight: wp(1),
  },
  profileSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
  },
  avatarContainer: {
    width: hp(12),
    height: hp(12),
    borderRadius: hp(6),
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: hp(6),
  },
  actionButtons: {},
  actionButton: {
    display: "flex",
    flexDirection: "row",
    gap: wp(2),
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    color: "white",
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    borderRadius: wp(4),
    width: "max-content",
  },
  actionButtonText: {
    fontSize: hp(2),
    fontWeight: "400",
    color: "white",
  },
  statsContainer: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: hp(2),
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: hp(0.5),
    width: wp(23),
  },
  statNumber: {
    fontSize: hp(2.2),
    fontWeight: "bold",
    marginRight: wp(1),
  },
  statLabel: {
    fontSize: hp(1.8),
    color: "#666",
  },
  bioSection: {
    marginBottom: hp(2),
    paddingHorizontal: wp(2),
  },
  name: {
    fontSize: hp(2.2),
    fontWeight: "bold",
    marginBottom: hp(0.5),
  },
  bio: {
    fontSize: hp(2),
    marginBottom: hp(0.5),
  },
  title: {
    fontSize: hp(1.8),
    color: "#666",
    marginBottom: hp(0.5),
  },
  link: {
    fontSize: hp(1.8),
    color: "#00376B",
  },

  contentContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: wp(4),
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  tabButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    alignItems: "center",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: hp(2),
    color: theme.colors.text,
  },
  activeTabButtonText: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp(8),
  },
  emptyStateText: {
    fontSize: hp(2.2),
    color: "#1b1b1b80",
    marginVertical: hp(2),
    textAlign: "center",
  },
  createPostButton: {
    backgroundColor: theme.colors.primary,
    padding: hp(1.5),
    borderRadius: 5,
    marginTop: hp(2),
    display: "flex",
    flexDirection: "row",
  },
  createPostButtonText: {
    color: "#fff",
    fontSize: hp(2),
    fontWeight: "bold",
    marginRight: wp(2),
  },
  gridContainer: {
    justifyContent: "space-between",
    paddingHorizontal: wp(2),
    marginBottom: hp(1),
    paddingTop: hp(2),
  },
  postsList: {
    paddingBottom: hp(4),
  },
  postPreview: {
    width: (screenWidth - wp(16)) / 2,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: hp(1),
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  repostPreview: {
    width: (screenWidth - wp(16)) / 2,
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: hp(1),
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  repostHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(2),
  },
  repostText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginLeft: wp(1),
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(2),
  },
  previewAvatar: {
    marginRight: wp(2),
  },
  previewUsername: {
    fontSize: hp(1.8),
    fontWeight: "500",
    color: theme.colors.textDark,
  },
  previewBody: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    paddingHorizontal: wp(2),
    marginBottom: hp(1),
  },
  previewContainer: {
    width: "100%",
    height: hp(20),
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  repostPreviewContainer: {
    width: "100%",
    height: hp(18),
    borderRadius: 4,
    overflow: "hidden",
  },
  repostPreviewImage: {
    width: wp(41.5),
    height: hp(16),
    resizeMode: "cover",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: hp(0.5),
    marginBottom: hp(1),
  },
  dot: {
    height: 5,
    width: 5,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginHorizontal: 2,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
  },
  previewStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: wp(2),
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    marginTop: "auto",
  },
  postStatItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginLeft: wp(1),
  },
});
