import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { Video, Comment, UserProfile } from "../backend.d.ts";
import { Principal } from "@icp-sdk/core/principal";
import { ExternalBlob } from "../backend.js";

// ============ Video Queries ============

export function useGetAllVideos() {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVideo(videoId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Video | null>({
    queryKey: ["video", videoId],
    queryFn: async () => {
      if (!actor || !videoId) return null;
      return actor.getVideo(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

export function useGetVideosByUploaderId(uploaderId: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Video[]>({
    queryKey: ["videos", "uploader", uploaderId?.toString()],
    queryFn: async () => {
      if (!actor || !uploaderId) return [];
      return actor.getVideosByUploaderId(uploaderId);
    },
    enabled: !!actor && !isFetching && !!uploaderId,
  });
}

export function useGetVideoLikes(videoId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["video", videoId, "likes"],
    queryFn: async () => {
      if (!actor || !videoId) return BigInt(0);
      return actor.getVideoLikes(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

// ============ Video Mutations ============

export function useCreateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      video,
      thumbnail,
    }: {
      title: string;
      description: string;
      video: ExternalBlob;
      thumbnail: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createVideo(title, description, video, thumbnail);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useIncrementViewCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.incrementViewCount(videoId);
    },
    onSuccess: (_, videoId) => {
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useLikeVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.likeVideo(videoId);
    },
    onSuccess: (_, videoId) => {
      queryClient.invalidateQueries({ queryKey: ["video", videoId, "likes"] });
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
    },
  });
}

export function useUnlikeVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.unlikeVideo(videoId);
    },
    onSuccess: (_, videoId) => {
      queryClient.invalidateQueries({ queryKey: ["video", videoId, "likes"] });
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
    },
  });
}

// ============ Comment Queries ============

export function useGetVideoComments(videoId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", videoId],
    queryFn: async () => {
      if (!actor || !videoId) return [];
      return actor.getVideoComments(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

// ============ Comment Mutations ============

export function usePostComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, text }: { videoId: string; text: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.postComment(videoId, text);
    },
    onSuccess: (_, { videoId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, commentId }: { videoId: string; commentId: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteComment(videoId, commentId);
    },
    onSuccess: (_, { videoId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
    },
  });
}

// ============ User Profile Queries ============

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(userId: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

// ============ User Profile Mutations ============

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ============ Subscription Queries ============

export function useGetChannelSubscribers(channelId: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["subscribers", channelId?.toString()],
    queryFn: async () => {
      if (!actor || !channelId) return BigInt(0);
      return actor.getChannelSubscribers(channelId);
    },
    enabled: !!actor && !isFetching && !!channelId,
  });
}

// ============ Subscription Mutations ============

export function useSubscribeToChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelId: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.subscribeToChannel(channelId);
    },
    onSuccess: (_, channelId) => {
      queryClient.invalidateQueries({ queryKey: ["subscribers", channelId.toString()] });
    },
  });
}

export function useUnsubscribeFromChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelId: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return actor.unsubscribeFromChannel(channelId);
    },
    onSuccess: (_, channelId) => {
      queryClient.invalidateQueries({ queryKey: ["subscribers", channelId.toString()] });
    },
  });
}
