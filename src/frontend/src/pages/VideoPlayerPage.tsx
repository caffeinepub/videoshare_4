import { useParams, Link } from "@tanstack/react-router";
import {
  useGetVideo,
  useGetVideoComments,
  useIncrementViewCount,
  useLikeVideo,
  useUnlikeVideo,
  useGetChannelSubscribers,
  useSubscribeToChannel,
  useUnsubscribeFromChannel,
} from "../hooks/useQueries";
import { VideoPlayer } from "../components/VideoPlayer";
import { CommentList } from "../components/CommentList";
import { CommentForm } from "../components/CommentForm";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { formatRelativeTime, formatViews, formatCount } from "../utils/format";
import { ThumbsUp, Loader2, UserPlus, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { toast } from "sonner";

export function VideoPlayerPage() {
  const { videoId } = useParams({ from: "/video/$videoId" });
  const { data: video, isLoading: videoLoading } = useGetVideo(videoId);
  const { data: comments, isLoading: commentsLoading } = useGetVideoComments(videoId);
  const { identity } = useInternetIdentity();
  const [viewIncremented, setViewIncremented] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasSubscribed, setHasSubscribed] = useState(false);

  const incrementViewMutation = useIncrementViewCount();
  const likeMutation = useLikeVideo();
  const unlikeMutation = useUnlikeVideo();
  const subscribeMutation = useSubscribeToChannel();
  const unsubscribeMutation = useUnsubscribeFromChannel();

  const { data: subscriberCount } = useGetChannelSubscribers(video?.uploaderId);

  const isOwnVideo = identity && video && video.uploaderId.toString() === identity.getPrincipal().toString();

  useEffect(() => {
    if (video && !viewIncremented) {
      incrementViewMutation.mutate(videoId);
      setViewIncremented(true);
    }
  }, [video, videoId, viewIncremented, incrementViewMutation]);

  const handleLike = async () => {
    if (!identity) {
      toast.error("Please login to like videos");
      return;
    }

    try {
      if (hasLiked) {
        await unlikeMutation.mutateAsync(videoId);
        setHasLiked(false);
      } else {
        await likeMutation.mutateAsync(videoId);
        setHasLiked(true);
      }
    } catch (error) {
      toast.error("Failed to update like");
      console.error("Like error:", error);
    }
  };

  const handleSubscribe = async () => {
    if (!identity) {
      toast.error("Please login to subscribe");
      return;
    }

    if (!video) return;

    try {
      if (hasSubscribed) {
        await unsubscribeMutation.mutateAsync(video.uploaderId);
        setHasSubscribed(false);
        toast.success("Unsubscribed");
      } else {
        await subscribeMutation.mutateAsync(video.uploaderId);
        setHasSubscribed(true);
        toast.success("Subscribed!");
      }
    } catch (error) {
      toast.error("Failed to update subscription");
      console.error("Subscribe error:", error);
    }
  };

  if (videoLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Video not found</p>
          <p className="mt-2 text-sm text-muted-foreground">The video you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-6xl">
        {/* Video Player */}
        <div className="animate-scale-in">
          <VideoPlayer video={video} />
        </div>

        {/* Video Info */}
        <div className="mt-6 space-y-4 animate-fade-in">
          <h1 className="font-display text-3xl font-bold leading-tight text-foreground">
            {video.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/channel/$userId"
                params={{ userId: video.uploaderId.toString() }}
                className="flex items-center gap-3 transition-transform hover:scale-105"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-display text-lg font-bold text-primary">
                  {video.uploaderName[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{video.uploaderName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCount(subscriberCount || BigInt(0))} subscribers
                  </p>
                </div>
              </Link>

              {!isOwnVideo && identity && (
                <Button
                  variant={hasSubscribed ? "secondary" : "default"}
                  size="sm"
                  onClick={handleSubscribe}
                  disabled={subscribeMutation.isPending || unsubscribeMutation.isPending}
                  className="gap-2"
                >
                  {hasSubscribed ? (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Subscribed
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Subscribe
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={hasLiked ? "default" : "secondary"}
                size="sm"
                onClick={handleLike}
                disabled={!identity || likeMutation.isPending || unlikeMutation.isPending}
                className="gap-2"
              >
                <ThumbsUp className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
                {formatCount(video.likeCount)}
              </Button>
              <div className="text-sm text-muted-foreground">
                {formatViews(video.viewCount)} • {formatRelativeTime(video.timestamp)}
              </div>
            </div>
          </div>

          {video.description && (
            <div className="rounded-lg bg-muted p-4">
              <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                {video.description}
              </p>
            </div>
          )}
        </div>

        <Separator className="my-8" />

        {/* Comments Section */}
        <div className="space-y-6 animate-fade-in">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {comments?.length || 0} Comments
          </h2>

          {identity ? (
            <CommentForm videoId={videoId} />
          ) : (
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
              Please login to leave a comment
            </div>
          )}

          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <CommentList comments={comments || []} videoId={videoId} />
          )}
        </div>
      </div>
    </div>
  );
}
