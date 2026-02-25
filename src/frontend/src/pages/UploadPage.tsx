import { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useCreateVideo } from "../hooks/useQueries";
import { ExternalBlob } from "../backend.js";
import { toast } from "sonner";
import { Upload, Loader2, Video, Image } from "lucide-react";
import { Progress } from "../components/ui/progress";

export function UploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const createVideoMutation = useCreateVideo();
  const navigate = useNavigate();

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's a video file
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a valid video file");
        return;
      }
      setVideoFile(file);
      setVideoProgress(0);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's an image file
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setThumbnailFile(file);
      setThumbnailProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!videoFile) {
      toast.error("Please select a video file");
      return;
    }

    try {
      // Convert video file to bytes
      const videoBytes = new Uint8Array(await videoFile.arrayBuffer());
      const videoBlob = ExternalBlob.fromBytes(videoBytes).withUploadProgress((percentage) => {
        setVideoProgress(percentage);
      });

      // Convert thumbnail file to bytes if provided
      let thumbnailBlob: ExternalBlob | null = null;
      if (thumbnailFile) {
        const thumbnailBytes = new Uint8Array(await thumbnailFile.arrayBuffer());
        thumbnailBlob = ExternalBlob.fromBytes(thumbnailBytes).withUploadProgress((percentage) => {
          setThumbnailProgress(percentage);
        });
      }

      const videoId = await createVideoMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        video: videoBlob,
        thumbnail: thumbnailBlob,
      });

      toast.success("Video uploaded successfully!");
      navigate({ to: "/video/$videoId", params: { videoId } });
    } catch (error) {
      toast.error("Failed to upload video");
      console.error("Upload error:", error);
    }
  };

  const isUploading = createVideoMutation.isPending;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card className="animate-scale-in">
        <CardHeader>
          <CardTitle className="font-display text-3xl">Upload Video</CardTitle>
          <CardDescription>Share your content with the world</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell viewers about your video"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={5000}
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label>Video File *</Label>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => videoInputRef.current?.click()}
                disabled={isUploading}
                className="w-full gap-2"
              >
                <Video className="h-4 w-4" />
                {videoFile ? videoFile.name : "Select Video"}
              </Button>
              {isUploading && videoProgress > 0 && (
                <div className="space-y-1">
                  <Progress value={videoProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Uploading video: {videoProgress}%
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Thumbnail (Optional)</Label>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={isUploading}
                className="w-full gap-2"
              >
                <Image className="h-4 w-4" />
                {thumbnailFile ? thumbnailFile.name : "Select Thumbnail"}
              </Button>
              {isUploading && thumbnailProgress > 0 && (
                <div className="space-y-1">
                  <Progress value={thumbnailProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Uploading thumbnail: {thumbnailProgress}%
                  </p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={!title.trim() || !videoFile || isUploading}
              className="w-full gap-2"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Upload Video
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
