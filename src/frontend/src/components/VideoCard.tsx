import { Link } from "@tanstack/react-router";
import type { Video } from "../backend.d.ts";
import { formatRelativeTime, formatViews } from "../utils/format";
import { useState } from "react";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const thumbnailUrl = video.thumbnail?.getDirectURL();

  return (
    <Link
      to="/video/$videoId"
      params={{ videoId: video.id }}
      className="group block animate-fade-in"
    >
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted transition-all duration-300 group-hover:shadow-cinematic">
        {thumbnailUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-muted" />
            )}
            <img
              src={thumbnailUrl}
              alt={video.title}
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <div className="text-4xl text-muted-foreground">📹</div>
          </div>
        )}
        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-medium text-white">
          {formatViews(video.viewCount)}
        </div>
      </div>

      <div className="mt-3">
        <h3 className="font-display text-lg font-semibold leading-tight text-foreground transition-colors line-clamp-2 group-hover:text-primary">
          {video.title}
        </h3>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium hover:text-foreground">{video.uploaderName}</span>
          <span>•</span>
          <span>{formatRelativeTime(video.timestamp)}</span>
        </div>
      </div>
    </Link>
  );
}
