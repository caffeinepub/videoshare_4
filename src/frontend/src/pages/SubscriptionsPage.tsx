import { useGetAllVideos } from "../hooks/useQueries";
import { VideoCard } from "../components/VideoCard";
import { Loader2 } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function SubscriptionsPage() {
  const { identity } = useInternetIdentity();
  const { data: videos, isLoading } = useGetAllVideos();

  // Note: Backend doesn't have a getSubscribedChannels() or getSubscriptionFeed() endpoint,
  // so we show all videos as a simplified version. In a real app, we'd filter by subscriptions.

  if (!identity) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Please login</p>
          <p className="mt-2 text-sm text-muted-foreground">
            You need to be logged in to view your subscriptions
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-display font-semibold text-foreground">No videos yet</p>
          <p className="mt-2 text-muted-foreground">
            Subscribe to channels to see their latest uploads here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 font-display text-4xl font-bold text-foreground animate-fade-in">
        Latest Videos
      </h1>
      <p className="mb-6 text-muted-foreground">
        Showing all videos. Videos from your subscribed channels will appear here.
      </p>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
