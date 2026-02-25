import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import ExternalBlob "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // UserProfile type
  public type UserProfile = {
    username : Text;
    avatar : ?ExternalBlob.ExternalBlob;
    bio : Text;
  };

  module UserProfile {
    public func compare(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      Text.compare(p1.username, p2.username);
    };
  };

  // Video type
  public type Video = {
    id : Text;
    title : Text;
    description : Text;
    video : ExternalBlob.ExternalBlob;
    thumbnail : ?ExternalBlob.ExternalBlob;
    uploaderId : Principal;
    uploaderName : Text;
    viewCount : Nat;
    likeCount : Nat;
    timestamp : Time.Time;
  };

  // Comment type
  public type Comment = {
    id : Text;
    videoId : Text;
    userId : Principal;
    username : Text;
    text : Text;
    timestamp : Time.Time;
  };

  // Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let videos = Map.empty<Text, Video>();
  let videoLikes = Map.empty<Text, Set.Set<Principal>>();
  let subscriptions = Map.empty<Principal, Set.Set<Principal>>();
  let comments = Map.empty<Text, [Comment]>();

  // Helper Functions
  func generateId() : Text {
    let time = Time.now();
    time.toText();
  };

  func ensureUserProfileExists(caller : Principal) {
    if (not userProfiles.containsKey(caller)) {
      Runtime.trap("User profile does not exist");
    };
  };

  // User Profile Methods
  public query ({ caller }) func getCallerUserProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    ensureUserProfileExists(caller);
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Video Management
  public shared ({ caller }) func createVideo(
    title : Text,
    description : Text,
    video : ExternalBlob.ExternalBlob,
    thumbnail : ?ExternalBlob.ExternalBlob
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create videos");
    };
    ensureUserProfileExists(caller);

    let videoId = generateId();
    let uploaderProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Uploader profile not found") };
      case (?profile) { profile };
    };

    let newVideo : Video = {
      id = videoId;
      title;
      description;
      video;
      thumbnail;
      uploaderId = caller;
      uploaderName = uploaderProfile.username;
      viewCount = 0;
      likeCount = 0;
      timestamp = Time.now();
    };

    videos.add(videoId, newVideo);
    videoId;
  };

  public query func getVideo(videoId : Text) : async Video {
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) { video };
    };
  };

  public query func getAllVideos() : async [Video] {
    videos.values().toArray();
  };

  public query func getVideosByUploaderId(uploaderId : Principal) : async [Video] {
    let filtered = videos.values().toArray().filter(
      func(video) { video.uploaderId == uploaderId }
    );
    filtered;
  };

  public shared ({ caller }) func deleteVideo(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete videos");
    };
    ensureUserProfileExists(caller);

    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        if (video.uploaderId != caller) {
          Runtime.trap("Only the uploader can delete this video");
        };
      };
    };

    videos.remove(videoId);
    videoLikes.remove(videoId);
  };

  public shared func incrementViewCount(videoId : Text) : async () {
    switch (videos.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?video) {
        let updatedVideo = {
          video with viewCount = video.viewCount + 1;
        };
        videos.add(videoId, updatedVideo);
      };
    };
  };

  // Engagement Methods
  public shared ({ caller }) func likeVideo(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like videos");
    };
    ensureUserProfileExists(caller);

    if (not videos.containsKey(videoId)) {
      Runtime.trap("Video not found");
    };

    let currentLikes = switch (videoLikes.get(videoId)) {
      case (null) { Set.empty<Principal>() };
      case (?likes) { likes };
    };

    if (currentLikes.contains(caller)) {
      Runtime.trap("User has already liked this video");
    };

    let updatedLikes = Set.empty<Principal>();
    for (like in currentLikes.values()) {
      updatedLikes.add(like);
    };
    updatedLikes.add(caller);

    videoLikes.add(videoId, updatedLikes);

    switch (videos.get(videoId)) {
      case (?video) {
        let newLikeCount = updatedLikes.size();
        let updatedVideo = {
          video with likeCount = newLikeCount;
        };
        videos.add(videoId, updatedVideo);
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func unlikeVideo(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike videos");
    };
    ensureUserProfileExists(caller);

    if (not videos.containsKey(videoId)) {
      Runtime.trap("Video not found");
    };

    let currentLikes = switch (videoLikes.get(videoId)) {
      case (null) { Set.empty<Principal>() };
      case (?likes) { likes };
    };

    if (not currentLikes.contains(caller)) {
      Runtime.trap("User has not liked this video");
    };

    let updatedLikes = Set.empty<Principal>();
    for (like in currentLikes.values()) {
      if (like != caller) {
        updatedLikes.add(like);
      };
    };

    videoLikes.add(videoId, updatedLikes);

    switch (videos.get(videoId)) {
      case (?video) {
        let newLikeCount = updatedLikes.size();
        let updatedVideo = {
          video with likeCount = newLikeCount;
        };
        videos.add(videoId, updatedVideo);
      };
      case (null) {};
    };
  };

  public query func getVideoLikes(_videoId : Text) : async Nat {
    switch (videoLikes.get(_videoId)) {
      case (null) { 0 };
      case (?likes) { likes.size() };
    };
  };

  // Subscription Methods
  public shared ({ caller }) func subscribeToChannel(channelId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can subscribe to channels");
    };
    ensureUserProfileExists(caller);

    if (caller == channelId) {
      Runtime.trap("Cannot subscribe to yourself");
    };

    let channelSubs = switch (subscriptions.get(channelId)) {
      case (null) { Set.empty<Principal>() };
      case (?subs) { subs };
    };

    if (channelSubs.contains(caller)) {
      Runtime.trap("Already subscribed to this channel");
    };

    let updatedSubs = Set.empty<Principal>();
    for (sub in channelSubs.values()) {
      updatedSubs.add(sub);
    };
    updatedSubs.add(caller);

    subscriptions.add(channelId, updatedSubs);
  };

  public shared ({ caller }) func unsubscribeFromChannel(channelId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unsubscribe from channels");
    };
    ensureUserProfileExists(caller);

    if (caller == channelId) {
      Runtime.trap("Cannot unsubscribe from yourself");
    };

    let channelSubs = switch (subscriptions.get(channelId)) {
      case (null) { Set.empty<Principal>() };
      case (?subs) { subs };
    };

    if (not channelSubs.contains(caller)) {
      Runtime.trap("No active subscription found for you on this channel");
    };

    let updatedSubs = Set.empty<Principal>();
    for (sub in channelSubs.values()) {
      if (sub != caller) {
        updatedSubs.add(sub);
      };
    };

    subscriptions.add(channelId, updatedSubs);
  };

  public query func getChannelSubscribers(channelId : Principal) : async Nat {
    switch (subscriptions.get(channelId)) {
      case (null) { 0 };
      case (?subs) { subs.size() };
    };
  };

  // Comment Methods
  public shared ({ caller }) func postComment(
    videoId : Text,
    text : Text
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post comments");
    };
    ensureUserProfileExists(caller);

    if (not videos.containsKey(videoId)) {
      Runtime.trap("Video not found");
    };

    let userProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };

    let commentId = generateId();
    let newComment : Comment = {
      id = commentId;
      videoId;
      userId = caller;
      username = userProfile.username;
      text;
      timestamp = Time.now();
    };

    let currentComments = switch (comments.get(videoId)) {
      case (null) { [] };
      case (?existing) { existing };
    };

    let updatedComments = [newComment].concat(currentComments);
    comments.add(videoId, updatedComments);
    commentId;
  };

  public shared ({ caller }) func deleteComment(videoId : Text, commentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete comments");
    };
    ensureUserProfileExists(caller);

    if (not videos.containsKey(videoId)) {
      Runtime.trap("Video not found");
    };

    let updatedComments = switch (comments.get(videoId)) {
      case (null) { Runtime.trap("No comments found for this video") };
      case (?existing) {
        let filteredComments = existing.filter(
          func(comment) {
            if (comment.id == commentId and comment.userId != caller) {
              Runtime.trap("Only your own comments can be deleted");
            };
            comment.id != commentId;
          }
        );
        filteredComments;
      };
    };

    comments.add(videoId, updatedComments);
  };

  public query func getVideoComments(videoId : Text) : async [Comment] {
    switch (comments.get(videoId)) {
      case (null) { [] };
      case (?videoComments) {
        videoComments;
      };
    };
  };
};
