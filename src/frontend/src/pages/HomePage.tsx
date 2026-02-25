import { useGetAllVideos } from "../hooks/useQueries";
import { VideoCard } from "../components/VideoCard";
import { Loader2 } from "lucide-react";

export function HomePage() {
  const { data: videos, isLoading, error } = useGetAllVideos();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Error loading videos</p>
          <p className="mt-2 text-sm text-muted-foreground">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-display font-semibold text-foreground">No videos yet</p>
          <p className="mt-2 text-muted-foreground">Be the first to upload a video!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
