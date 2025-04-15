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

const RenderFileSlider = ({ files, isRepost = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef();

  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
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
        style={isRepost ? styles.repostSliderContainer : styles.sliderContainer}
      >
        {files.map((file, index) =>
          file.type === "image" ? (
            <Image
              key={index}
              source={{ uri: file.uri }}
              style={isRepost ? styles.repostImage : styles.postImage}
              resizeMode="cover"
            />
          ) : (
            <Video
              key={index}
              source={{ uri: file.uri }}
              useNativeControls
              resizeMode="cover"
              style={isRepost ? styles.repostImage : styles.postImage}
            />
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

function likesText(likes) {
  if (!likes || likes === 0) return "";
  if (likes === 1) return "1";
  return `${likes}`;
}

const UserHeader = ({ user, router }) => {
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
    <LinearGradient
      colors={["#f8f9fa", "#e9ecef"]}
      style={styles.headerContainer}
    >
      <View style={styles.headerContent}>
        <Header title="Profile" showBackButton={true} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={hp(2.8)} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.avatarEditContainer}>
          <Avatar
            size={hp(14)}
            source={user?.image ? { uri: user.image } : defaultAvatar}
            style={styles.avatar}
          />
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("editProfile")}
          >
            <Icon name="edit" size={hp(2)} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{user.name}</Text>

          {user?.bio && <Text style={styles.userBio}>{user.bio}</Text>}

          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>124</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1.2k</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>356</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        <View style={styles.userDetails}>
          {user?.address && (
            <View style={styles.detailItem}>
              <Icon
                name="map-pin"
                size={hp(2)}
                color={theme.colors.textLight}
              />
              <Text style={styles.detailText}>{user.address}</Text>
            </View>
          )}

          <View style={styles.detailItem}>
            <Icon name="mail" size={hp(2)} color={theme.colors.textLight} />
            <Text style={styles.detailText}>{user.email}</Text>
          </View>

          {user?.phoneNumber && (
            <View style={styles.detailItem}>
              <Icon name="phone" size={hp(2)} color={theme.colors.textLight} />
              <Text style={styles.detailText}>{user.phoneNumber}</Text>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

export default Profile = () => {
  const { user, setAuth } = useAuth();
  const [type, setType] = React.useState("my_posts");
  const router = useRouter();
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showComments, setShowComments] = React.useState(false);
  const [selectedPostId, setSelectedPostId] = React.useState(null);

  const isLiked = (post) => {
    if (!user) return false;
    const liked = post.postLikes?.find((like) => like.userId === user.id);
    return !!liked;
  };

  const isBookmarked = (post) => {
    if (!user) return false;
    const bookmarked = post.postBookmarks?.find(
      (bookmark) => bookmark.userId === user.id,
    );
    return !!bookmarked;
  };

  const toggleLikePost = async (postId) => {
    if (!user) {
      Alert.alert("Please Sign In", "You need to sign in to like a post", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign In",
          onPress: () => router.push("login"),
        },
      ]);
      return;
    }

    let post = posts.find((post) => post.id === postId);
    if (!post) return;

    const liked = isLiked(post);

    if (liked) {
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              postLikes: post.postLikes.filter(
                (like) => like.userId !== user.id,
              ),
            };
          }
          return post;
        }),
      );

      const { data, error } = await supabase
        .from("postLikes")
        .delete()
        .eq("userId", user.id)
        .eq("postId", postId);
    } else {
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              postLikes: [...(post.postLikes || []), { userId: user.id }],
            };
          }
          return post;
        }),
      );

      const { data, error } = await supabase
        .from("postLikes")
        .insert({
          userId: user.id,
          postId: postId,
        })
        .select("*");
    }
  };

  const toggleBookmarkPost = async (postId) => {
    if (!user) {
      Alert.alert("Please Sign In", "You need to sign in to bookmark a post", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign In",
          onPress: () => router.push("login"),
        },
      ]);
      return;
    }

    let post = posts.find((post) => post.id === postId);
    if (!post) return;
    const bookmarked = isBookmarked(post);
    if (bookmarked) {
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              postBookmarks: post.postBookmarks.filter(
                (bookmark) => bookmark.userId !== user.id,
              ),
            };
          }
          return post;
        }),
      );

      const { data, error } = await supabase
        .from("postBookmarks")
        .delete()
        .eq("userId", user.id)
        .eq("postId", postId);
    } else {
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              postBookmarks: [
                ...(post.postBookmarks || []),
                { userId: user.id },
              ],
            };
          }
          return post;
        }),
      );

      const { data, error } = await supabase
        .from("postBookmarks")
        .insert({
          userId: user.id,
          postId: postId,
        })
        .select("*");
    }
  };

  const repost = async (post) => {
    if (!user) {
      Alert.alert("Please Sign In", "You need to sign in to repost", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign In",
          onPress: () => router.push("login"),
        },
      ]);
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        userId: user.id,
        type: "special",
        original_post: post.id,
      })
      .select("*");

    if (error) {
      Alert.alert("Error", "Failed to repost");
      return;
    }

    Alert.alert("Success", "Post reposted successfully");
  };

  useEffect(() => {
    async function fetchMyPosts() {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, users (id, name, image), postLikes (id, userId), postBookmarks (id, userId), posts:original_post(*, users (id, name, image))",
        )
        .match({ userId: user.id, type: "normal" })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
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
          "*, users (id, name, image), postLikes (id, userId), postBookmarks (id, userId), posts:original_post(*, users (id, name, image))",
        )
        .match({ userId: user.id, type: "special" })
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching reposts:", error);
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

  return (
    <ScreenWrapper>
      <UserHeader user={user} router={router} />

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
            <Icon name="camera" size={hp(8)} color={theme.colors.textLight} />
            <Text style={styles.emptyStateText}>
              {type === "my_posts"
                ? "You haven't posted anything yet"
                : "You haven't reposted anything yet"}
            </Text>
            <Button
              title={`Create your first ${type === "my_posts" ? "post" : "post"}`}
              onPress={() => router.push("newPost")}
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isRepost = item.type === "special";
              const files = isRepost
                ? JSON.parse(item.posts?.file || "[]")
                : JSON.parse(item.file || "[]");

              return (
                <View style={styles.postCard} key={item.id}>
                  {isRepost && (
                    <View style={styles.repostHeader}>
                      <Icon
                        name="repeat"
                        size={hp(2.5)}
                        color={theme.colors.textLight}
                      />
                      <Text style={styles.repostText}>
                        {item.users?.name} reposted
                      </Text>
                    </View>
                  )}

                  <View style={styles.postHeader}>
                    <Avatar
                      source={
                        isRepost
                          ? item.posts?.users?.image || defaultAvatar
                          : item.users?.image || defaultAvatar
                      }
                      size={hp(5)}
                      style={styles.postAvatar}
                    />
                    <View>
                      <Text style={styles.postUserName}>
                        {isRepost ? item.posts?.users?.name : item.users?.name}
                      </Text>
                      <Text style={styles.postDate}>
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.postBody}>
                    {isRepost ? item.posts?.body : item.body}
                  </Text>

                  {files.length > 0 && (
                    <RenderFileSlider files={files} isRepost={isRepost} />
                  )}

                  <View style={styles.postActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => toggleLikePost(item.id)}
                    >
                      <Icon
                        name="heart"
                        size={hp(3)}
                        color={isLiked(item) ? theme.colors.danger : "#6c757d"}
                      />
                      <Text style={styles.actionText}>
                        {likesText(item.postLikes?.length)}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        setSelectedPostId(item.id);
                        setShowComments(true);
                      }}
                    >
                      <Icon
                        name="message-square"
                        size={hp(3)}
                        color="#6c757d"
                      />
                      <Text style={styles.actionText}>Comment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => repost(item)}
                    >
                      <Icon name="repeat" size={hp(3)} color="#6c757d" />
                      <Text style={styles.actionText}>Repost</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => toggleBookmarkPost(item.id)}
                    >
                      <Icon
                        name="bookmark"
                        size={hp(3)}
                        color={
                          isBookmarked(item) ? theme.colors.warning : "#6c757d"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            contentContainerStyle={styles.postsList}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerContent: {
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
  },
  logoutButton: {
    position: "absolute",
    right: wp(4),
    top: hp(2),
    backgroundColor: "white",
    padding: wp(2),
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileContainer: {
    paddingHorizontal: wp(4),
    marginTop: hp(2),
  },
  avatarEditContainer: {
    alignSelf: "center",
    marginBottom: hp(2),
  },
  avatar: {
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 50,
    padding: wp(1.5),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfoContainer: {
    alignItems: "center",
    marginBottom: hp(2),
  },
  userName: {
    fontSize: hp(2.8),
    fontWeight: "bold",
    color: theme.colors.textDark,
    marginBottom: hp(0.5),
  },
  userBio: {
    fontSize: hp(2),
    color: theme.colors.text,
    textAlign: "center",
    marginBottom: hp(2),
    paddingHorizontal: wp(8),
  },
  userStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: hp(2),
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: theme.colors.textDark,
  },
  statLabel: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
  },
  userDetails: {
    marginBottom: hp(2),
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1),
  },
  detailText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
    marginLeft: wp(2),
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#fff",
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
    color: theme.colors.textLight,
    marginVertical: hp(2),
    textAlign: "center",
  },
  postsList: {
    paddingBottom: hp(4),
  },
  postCard: {
    backgroundColor: "white",
    marginBottom: hp(2),
    paddingBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  repostHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(4),
    paddingBottom: 0,
  },
  repostText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    marginLeft: wp(1),
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(4),
    paddingBottom: hp(1),
  },
  postAvatar: {
    marginRight: wp(2),
  },
  postUserName: {
    fontSize: hp(2),
    fontWeight: "bold",
    color: theme.colors.textDark,
  },
  postDate: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  postBody: {
    fontSize: hp(2.2),
    color: theme.colors.text,
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
  },
  sliderContainer: {
    width: screenWidth,
    height: hp(50),
  },
  postImage: {
    width: screenWidth,
    height: hp(50),
    resizeMode: "cover",
  },
  repostSliderContainer: {
    width: screenWidth - wp(8),
    height: hp(50),
    marginLeft: wp(4),
    borderRadius: 8,
    overflow: "hidden",
  },
  repostImage: {
    width: screenWidth - wp(8),
    height: hp(50),
    resizeMode: "cover",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: hp(1),
    marginBottom: hp(2),
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    marginTop: hp(1),
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1),
  },
  actionText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    marginLeft: wp(1),
  },
});
