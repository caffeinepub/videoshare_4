import { useParams } from "@tanstack/react-router";
import { Principal } from "@icp-sdk/core/principal";
import {
  useGetUserProfile,
  useGetVideosByUploaderId,
  useGetChannelSubscribers,
  useSubscribeToChannel,
  useUnsubscribeFromChannel,
} from "../hooks/useQueries";
import { VideoCard } from "../components/VideoCard";
import { Button } from "../components/ui/button";
import { Loader2, UserPlus, UserCheck } from "lucide-react";
import { formatCount } from "../utils/format";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useState } from "react";
import { toast } from "sonner";

export function ChannelPage() {
  const { userId } = useParams({ from: "/channel/$userId" });
  const { identity } = useInternetIdentity();
  const [hasSubscribed, setHasSubscribed] = useState(false);

  const channelId = Principal.fromText(userId);
  const { data: profile, isLoading: profileLoading } = useGetUserProfile(channelId);
  const { data: videos, isLoading: videosLoading } = useGetVideosByUploaderId(channelId);
  const { data: subscriberCount } = useGetChannelSubscribers(channelId);

  const subscribeMutation = useSubscribeToChannel();
  const unsubscribeMutation = useUnsubscribeFromChannel();

  const isOwnChannel = identity && identity.getPrincipal().toString() === userId;

  const handleSubscribe = async () => {
    if (!identity) {
      toast.error("Please login to subscribe");
      return;
    }

    try {
      if (hasSubscribed) {
        await unsubscribeMutation.mutateAsync(channelId);
        setHasSubscribed(false);
        toast.success("Unsubscribed");
      } else {
        await subscribeMutation.mutateAsync(channelId);
        setHasSubscribed(true);
        toast.success("Subscribed!");
      }
    } catch (error) {
      toast.error("Failed to update subscription");
      console.error("Subscribe error:", error);
    }
  };

  if (profileLoading || videosLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Channel not found</p>
          <p className="mt-2 text-sm text-muted-foreground">This channel doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Channel Header */}
      <div className="mb-12 animate-fade-in">
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-lg sm:flex-row">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 font-display text-5xl font-bold text-primary shadow-cinematic">
            {profile.username[0].toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="font-display text-4xl font-bold text-foreground">{profile.username}</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {formatCount(subscriberCount || BigInt(0))} subscribers •{" "}
              {videos?.length || 0} videos
            </p>
            {profile.bio && (
              <p className="mt-4 text-foreground leading-relaxed">{profile.bio}</p>
            )}
          </div>
          {!isOwnChannel && identity && (
            <Button
              variant={hasSubscribed ? "secondary" : "default"}
              size="lg"
              onClick={handleSubscribe}
              disabled={subscribeMutation.isPending || unsubscribeMutation.isPending}
              className="gap-2"
            >
              {hasSubscribed ? (
                <>
                  <UserCheck className="h-5 w-5" />
                  Subscribed
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Subscribe
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Videos Grid */}
      <div>
        <h2 className="mb-6 font-display text-2xl font-bold text-foreground">Videos</h2>
        {!videos || videos.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-semibold text-muted-foreground">No videos yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {isOwnChannel ? "Upload your first video to get started" : "This channel hasn't uploaded any videos yet"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
