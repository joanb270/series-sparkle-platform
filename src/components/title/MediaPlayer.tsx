
import React, { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoPlayer from "@/components/VideoPlayer";
import { Video } from "@/types";

interface MediaPlayerProps {
  trailer?: Video;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ trailer }) => {
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  
  if (!trailer && !showVideoPlayer) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Reproducir</h2>
      {showVideoPlayer ? (
        <div className="mb-4">
          <VideoPlayer />
          <Button 
            variant="ghost" 
            className="mt-2" 
            onClick={() => setShowVideoPlayer(false)}
          >
            Cerrar reproductor
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button 
            className="gap-2" 
            onClick={() => setShowVideoPlayer(true)}
          >
            <Play className="h-4 w-4" fill="currentColor" />
            Ver ahora
          </Button>
          {trailer && (
            <a 
              href={`https://www.youtube.com/watch?v=${trailer.key}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                <Play className="h-4 w-4" />
                Ver Trailer
              </Button>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaPlayer;
