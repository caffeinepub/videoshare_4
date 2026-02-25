import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetVideosByUploaderId, useDeleteVideo } from "../hooks/useQueries";
import { VideoCard } from "../components/VideoCard";
import { Button } from "../components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import type { Video } from "../backend.d.ts";

export function MyVideosPage() {
  const { identity } = useInternetIdentity();
  const { data: videos, isLoading } = useGetVideosByUploaderId(identity?.getPrincipal());
  const deleteVideoMutation = useDeleteVideo();

  const handleDelete = async (videoId: string, videoTitle: string) => {
    try {
      await deleteVideoMutation.mutateAsync(videoId);
      toast.success(`"${videoTitle}" deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete video");
      console.error("Delete error:", error);
    }
  };

  if (!identity) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">Please login</p>
          <p className="mt-2 text-sm text-muted-foreground">You need to be logged in to view your videos</p>
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
          <p className="mt-2 text-muted-foreground">Upload your first video to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 font-display text-4xl font-bold text-foreground animate-fade-in">
        My Videos
      </h1>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video: Video) => (
          <div key={video.id} className="group relative">
            <VideoCard video={video} />
            <div className="mt-3 flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Video</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{video.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(video.id, video.title)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
