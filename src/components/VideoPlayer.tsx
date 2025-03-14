
import React from "react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ className }) => {
  return (
    <div className={cn("w-full rounded-md overflow-hidden bg-black", className)}>
      <video
        controls
        className="w-full aspect-video"
        poster="/placeholder.svg"
      >
        <source src="https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4" type="video/mp4" />
        Tu navegador no soporta videos HTML5.
      </video>
    </div>
  );
};

export default VideoPlayer;
