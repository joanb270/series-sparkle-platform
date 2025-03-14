
import React, { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSeasonDetails, fetchTvSeasons } from "@/lib/api";
import { Episode, Season } from "@/types";
import { toast } from "@/hooks/use-toast";
import VideoPlayer from "./VideoPlayer";

interface SeasonEpisodesProps {
  tvId: string;
}

const SeasonEpisodes: React.FC<SeasonEpisodesProps> = ({ tvId }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const seasonsData = await fetchTvSeasons(tvId);
        // Filter out specials (season 0)
        const filteredSeasons = seasonsData.filter((season: Season) => season.season_number > 0);
        setSeasons(filteredSeasons);
        
        // Set default selected season to first regular season
        if (filteredSeasons.length > 0) {
          setSelectedSeason(filteredSeasons[0].season_number);
        }
      } catch (error) {
        console.error("Error fetching seasons:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las temporadas. Inténtalo de nuevo más tarde.",
        });
      }
    };

    fetchSeasons();
  }, [tvId]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!selectedSeason) return;
      
      setIsLoading(true);
      try {
        const seasonData = await fetchSeasonDetails(tvId, selectedSeason);
        setEpisodes(seasonData.episodes || []);
      } catch (error) {
        console.error("Error fetching episodes:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los episodios. Inténtalo de nuevo más tarde.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpisodes();
  }, [tvId, selectedSeason]);

  const handleEpisodeClick = (episode: Episode) => {
    setSelectedEpisode(episode);
    setShowPlayer(true);
  };

  if (seasons.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Episodios</h2>
        <Select
          value={selectedSeason.toString()}
          onValueChange={(value) => setSelectedSeason(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar temporada" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((season) => (
              <SelectItem key={season.id} value={season.season_number.toString()}>
                {season.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showPlayer && selectedEpisode && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">
              {selectedEpisode.episode_number}. {selectedEpisode.name}
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowPlayer(false)}
            >
              Cerrar
            </Button>
          </div>
          <VideoPlayer />
        </div>
      )}

      <div className="rounded-md border">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-16 w-28 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1 p-1">
            {episodes.map((episode) => {
              const episodeImg = episode.still_path
                ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
                : "/placeholder.svg";
                
              return (
                <div 
                  key={episode.id}
                  className="rounded-md p-2 flex gap-4 hover:bg-accent/10 cursor-pointer"
                  onClick={() => handleEpisodeClick(episode)}
                >
                  <div className="relative w-28 h-16 overflow-hidden rounded bg-muted flex-shrink-0">
                    <img 
                      src={episodeImg} 
                      alt={episode.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
                      <Play className="h-8 w-8 text-white" fill="white" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {episode.episode_number}. {episode.name}
                    </h4>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      {episode.air_date && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(episode.air_date).toLocaleDateString()}
                        </span>
                      )}
                      {episode.runtime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {episode.runtime} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonEpisodes;
