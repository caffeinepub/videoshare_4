import { useEffect, useRef } from "react";
import type { Video } from "../backend.d.ts";

interface VideoPlayerProps {
  video: Video;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = video.video.getDirectURL();

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-cinematic-lg">
      <video
        ref={videoRef}
        className="h-full w-full"
        controls
        controlsList="nodownload"
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        <source src={videoUrl} type="video/ogg" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
