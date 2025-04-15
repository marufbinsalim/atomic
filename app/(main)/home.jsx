import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
  Alert,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/themes";
import Icon from "../../components/Icon";
import { useRouter } from "expo-router";
import Avatar from "../../components/Avatar";
import { defaultAvatar } from "../../constants";
import { Video } from "expo-av";
import SpinningIcon from "../../components/Loader";
import { RefreshControl } from "react-native";
import Loading from "../../components/Loading";
import CommentsDrawer from "../../components/Comments";
import MenuDrawer from "../../components/Menu";

const screenWidth = Dimensions.get("window").width;
export function timeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  const isThisYear = date.getFullYear() === now.getFullYear();
  const options = {
    month: "short",
    day: "numeric",
    ...(isThisYear ? {} : { year: "numeric" }),
  };

  return date.toLocaleDateString("en-US", options);
}

const RenderFileSlider = ({ files, isRepost = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef();

  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    console.log("Current index:", index);
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

export default Home = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [noMorePosts, setNoMorePosts] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const limit = 10;

  async function repost(post) {
    // handle repost
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
    console.log("Reposting post:", post);
    if (post.type === "repost") {
      const { error } = await supabase.from("posts").insert({
        userId: user.id,
        body: null,
        file: null,
        type: "repost",
        original_post: post.posts.id,
      });
      console.log("Repost error:", error);
    } else {
      const { error } = await supabase.from("posts").insert({
        userId: user.id,
        body: null,
        file: null,
        type: "repost",
        original_post: post.id,
      });
    }
  }
  async function repostWithCaption(post) {
    // handle repost with caption
  }

  const fetchPosts = async (page = 0) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select(
        `*, users (id, name, image), postLikes (id, userId), postBookmarks (id, userId), posts:original_post(*, users (id, name, image))`,
      )
      .range(page * limit, (page + 1) * limit - 1)
      .order("created_at", { ascending: false });

    console.log("Fetching post page:", page);
    console.log("Fetched page posts:", JSON.stringify(data));
    console.log("Error:", error);
    if (error || !data || data.length === 0) {
      console.log("No more posts to load");
      setNoMorePosts(true);
    } else {
      setPosts((prev) => [...prev, ...data]);
      setLoading(false);
      setPage(page + 1);
    }
    setLoading(false);
    setRefreshing(false);
  };

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

      console.log("Bookmark data:", data);
      console.log("Bookmark error:", error);
    }
  };

  useEffect(() => {
    if (loading && !noMorePosts) fetchPosts(page);
  }, [loading, page, noMorePosts]);

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            style={{
              width: wp(30),
              height: hp(4),
            }}
            source={require("../../assets/images/temp_logo.png")}
          />
          <View style={styles.icons}>
            {user && (
              <Pressable
                style={{
                  backgroundColor: "#F6F8FB",
                  borderRadius: hp(1),
                  padding: hp(0.5),
                }}
                onPress={() => router.push("notification")}
              >
                <Icon
                  name="notification"
                  size={hp(3.5)}
                  color={theme.colors.text}
                />
              </Pressable>
            )}

            {user && (
              <Pressable
                onPress={() => router.push("messenger")}
                style={{
                  backgroundColor: "#F6F8FB",
                  borderRadius: hp(1),
                  padding: hp(0.5),
                }}
              >
                <Icon name="message" size={hp(3.5)} color={theme.colors.text} />
              </Pressable>
            )}
          </View>
        </View>

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.postsContainer}
          onEndReached={() => setLoading(true)}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            noMorePosts ? (
              <Text style={{ textAlign: "center", padding: hp(2) }}>
                No more posts to load
              </Text>
            ) : loading && !refreshing ? (
              <View style={{ padding: hp(2) }}>
                <Loading />
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={loading && !noMorePosts}
              onRefresh={() => {
                setRefreshing(true);
                setPosts([]);
                setPage(0);
                setNoMorePosts(false);
                setLoading(true);
              }}
            />
          }
          renderItem={({ item }) => {
            const isRepost = item.type === "repost";
            const files = isRepost
              ? JSON.parse(item.posts.file || "[]")
              : JSON.parse(item.file || "[]");

            if (isRepost) {
              return (
                <View style={styles.postCard} key={item.id}>
                  <View style={styles.postHeader}>
                    <Avatar
                      source={item.posts?.users?.image || defaultAvatar}
                      size={hp(4)}
                      style={styles.avatarImage}
                    />

                    <View
                      style={{
                        flexDirection: "column",
                        paddingHorizontal: wp(2),
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "column",
                          marginBottom: hp(1),
                        }}
                      >
                        <Text style={styles.userName}>
                          {item?.posts?.users?.name}
                        </Text>

                        <Text
                          style={{
                            fontSize: hp(2),
                            color: "#aaa",
                          }}
                        >
                          reposted {timeAgo(new Date(item.created_at))}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.postCard} key={item.id}>
                    <View style={styles.postHeader}>
                      <Avatar
                        source={item.users?.image || defaultAvatar}
                        size={hp(4)}
                        style={styles.avatarImage}
                      />

                      <View
                        style={{
                          flexDirection: "column",
                          paddingHorizontal: wp(2),
                        }}
                      >
                        <Text style={styles.userName}>{item.users?.name}</Text>
                        <Text
                          style={{
                            color: "#aaa",
                            marginBottom: hp(1),
                          }}
                        >
                          {timeAgo(new Date(item.posts.created_at))}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.postBody}>{item.posts.body}</Text>
                    {files.length > 0 && (
                      <RenderFileSlider files={files} isRepost={true} />
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      paddingHorizontal: wp(4),
                      paddingVertical: hp(1),
                      gap: wp(4),
                    }}
                  >
                    <Pressable
                      onPress={() => toggleLikePost(item.id)}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: wp(2),
                      }}
                    >
                      <Icon
                        name="thumbsup"
                        size={hp(2.7)}
                        color={isLiked(item) ? "red" : "#000"}
                      />
                      {item.postLikes?.length > 0 && (
                        <Text
                          style={{
                            fontSize: hp(2),
                            color: "#000",
                          }}
                        >
                          {likesText(item.postLikes?.length)}
                        </Text>
                      )}
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setSelectedPostId(item.id);
                        setShowComments(true);
                      }}
                    >
                      <Icon name="MessageSquare" size={hp(2.7)} color="#000" />
                    </Pressable>
                    <Pressable onPress={() => repost(item)}>
                      <View style={{ flex: 1, alignItems: "flex-end" }}>
                        <Icon name="retweet" size={hp(2.7)} color="#000" />
                      </View>
                    </Pressable>
                    <Pressable onPress={() => toggleBookmarkPost(item.id)}>
                      <Icon
                        name="bookmark"
                        size={hp(2.7)}
                        color={isBookmarked(item) ? "red" : "#000"}
                      />
                    </Pressable>
                  </View>
                </View>
              );
            }

            return (
              <View style={styles.postCard} key={item.id}>
                <View style={styles.postHeader}>
                  <Avatar
                    source={item.users?.image || defaultAvatar}
                    size={hp(4)}
                    style={styles.avatarImage}
                  />
                  <View
                    style={{
                      flexDirection: "column",
                      paddingHorizontal: wp(2),
                    }}
                  >
                    <Text style={styles.userName}>{item.users?.name}</Text>
                    <Text
                      style={{
                        color: "#aaa",
                        marginBottom: hp(1),
                      }}
                    >
                      {timeAgo(new Date(item.created_at))}
                    </Text>
                  </View>
                </View>

                <Text style={styles.postBody}>{item.body}</Text>
                {files.length > 0 && <RenderFileSlider files={files} />}

                <View
                  style={{
                    flexDirection: "row",
                    paddingHorizontal: wp(4),
                    paddingVertical: hp(1),
                    gap: wp(4),
                  }}
                >
                  <Pressable
                    onPress={() => toggleLikePost(item.id)}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: wp(2),
                    }}
                  >
                    <Icon
                      name="thumbsup"
                      size={hp(2.7)}
                      color={isLiked(item) ? "red" : "#000"}
                    />
                    {item.postLikes?.length > 0 && (
                      <Text
                        style={{
                          fontSize: hp(2),
                          color: "#000",
                        }}
                      >
                        {likesText(item.postLikes?.length)}
                      </Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setSelectedPostId(item.id);
                      setShowComments(true);
                    }}
                  >
                    <Icon name="MessageSquare" size={hp(2.7)} color="#000" />
                  </Pressable>
                  <Pressable onPress={() => repost(item)}>
                    <View style={{ flex: 1, alignItems: "flex-end" }}>
                      <Icon name="retweet" size={hp(2.7)} color="#000" />
                    </View>
                  </Pressable>
                  <Pressable onPress={() => toggleBookmarkPost(item.id)}>
                    <Icon
                      name="bookmark"
                      size={hp(2.7)}
                      color={isBookmarked(item) ? "red" : "#000"}
                    />
                  </Pressable>
                </View>
              </View>
            );
          }}
        />

        {/* bottom footer  */}
        <View
          style={{
            paddingHorizontal: wp(8),
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              padding: hp(2),
              flexDirection: "row",
              gap: wp(8),
              marginTop: hp(2),
              justifyContent: "space-around",
            }}
          >
            <Icon name="home" size={hp(4)} fill="black" />
            <Pressable onPress={() => router.push("discover")}>
              <Icon name="scanSearch" size={hp(4)} color="#000" />
            </Pressable>
          </View>
          <View
            style={{
              position: "absolute",
              bottom: hp(3),
              left: screenWidth / 2 - hp(2.5),
              // linear gradient
              backgroundColor: theme.colors.primary,
              borderRadius: hp(5),
            }}
          >
            <Pressable onPress={() => setMenuVisible(true)}>
              <Icon name="circlePlus" size={hp(5)} color="#fff" />
            </Pressable>
          </View>
          <View
            style={{
              padding: hp(2),
              flexDirection: "row",
              gap: wp(8),
              marginTop: hp(2),
              justifyContent: "space-around",
            }}
          >
            <Icon name="live" size={hp(4)} color="#000" />
            {user && (
              <Pressable onPress={() => router.push("profile")}>
                <Avatar
                  source={user?.image || defaultAvatar}
                  size={hp(4)}
                  style={styles.avatarImage}
                />
              </Pressable>
            )}
            {!user && (
              <Pressable onPress={() => router.push("login")}>
                <Icon
                  name="userSignIn"
                  size={hp(4)}
                  color={theme.colors.text}
                />
              </Pressable>
            )}
          </View>
        </View>

        <MenuDrawer
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onCreatePost={() => {
            // handle new post
            router.push("newPost");
          }}
          onCreateStory={() => {
            // handle new story
          }}
          onGoLive={() => {
            // handle go live
          }}
        />

        <CommentsDrawer
          onClose={() => setShowComments(false)}
          visible={showComments}
          postId={selectedPostId}
          user={user}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  title: {
    color: "#000",
    fontSize: hp(3),
    fontWeight: "300",
    fontFamily: "Circular Std",
  },
  avatarImage: {
    height: hp(4),
    width: hp(4),
    borderRadius: hp(2),
    borderWidth: 1,
    borderColor: "#ddd",
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(4),
  },
  postsContainer: {
    minHeight: hp(100),
    paddingTop: hp(2),
    paddingBottom: hp(2),
    paddingHorizontal: wp(4),
    backgroundColor: "#F6F8FB",
  },
  postCard: {
    marginBottom: hp(3),
    backgroundColor: "#fff",
    padding: wp(2),
    paddingHorizontal: wp(4),
    border: 1,
    borderWidth: 0.1,
    borderColor: "#000",
    borderRadius: theme.radius.sm,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
  },
  userName: {
    fontWeight: "600",
    fontSize: hp(2),
    color: "#000",
  },
  postBody: {
    fontSize: hp(2),
    paddingHorizontal: wp(4),
    paddingBottom: hp(1),
    color: "#333",
  },
  sliderContainer: {
    width: screenWidth - wp(16),
    height: hp(40),
    marginBottom: hp(2),
  },
  postImage: {
    width: screenWidth - wp(16),
    height: hp(40),
    resizeMode: "cover",
    borderRadius: theme.radius.sm,
  },
  repostSliderContainer: {
    width: screenWidth - wp(24),
    height: hp(40),
    marginBottom: hp(2),
  },
  repostImage: {
    width: screenWidth - wp(24),
    height: hp(40),
    resizeMode: "cover",
    borderRadius: theme.radius.sm,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  dot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: "#000",
  },
});
