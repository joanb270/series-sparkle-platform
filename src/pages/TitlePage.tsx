
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { 
  fetchContentDetails, 
  fetchSimilarContent, 
  fetchContentVideos,
  fetchRecommendedContent 
} from "@/lib/api";
import { Content, Video } from "@/types";
import ContentHeader from "@/components/title/ContentHeader";
import ContentDetails from "@/components/title/ContentDetails";
import MediaPlayer from "@/components/title/MediaPlayer";
import RelatedContent from "@/components/title/RelatedContent";
import SeasonEpisodes from "@/components/SeasonEpisodes";
import ContentLoadingSkeleton from "@/components/title/ContentLoadingSkeleton";
import NotFoundContent from "@/components/title/NotFoundContent";

const TitlePage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const type = searchParams.get("type") || "movie";
  
  const [content, setContent] = useState<any>(null);
  const [similarContent, setSimilarContent] = useState<Content[]>([]);
  const [recommendedContent, setRecommendedContent] = useState<Content[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [contentData, similarData, videosData, recommendationsData] = await Promise.all([
          fetchContentDetails(id, type),
          fetchSimilarContent(id, type),
          fetchContentVideos(id, type),
          fetchRecommendedContent(id, type)
        ]);
        
        setContent(contentData);
        setSimilarContent(similarData);
        setVideos(videosData);
        setRecommendedContent(recommendationsData);
      } catch (error) {
        console.error("Error fetching content details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load content details. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, type, toast]);

  if (isLoading) {
    return <ContentLoadingSkeleton />;
  }

  if (!content) {
    return <NotFoundContent />;
  }

  const title = content.title || content.name;
  const backdropPath = content.backdrop_path
    ? `https://image.tmdb.org/t/p/original${content.backdrop_path}`
    : "/placeholder.svg";
  const posterPath = content.poster_path
    ? `https://image.tmdb.org/t/p/w500${content.poster_path}`
    : "/placeholder.svg";
  const releaseYear = (content.release_date || content.first_air_date || "").substring(0, 4);
  const contentType = type === "movie" ? "Película" : "Serie";
  const runtime = content.runtime 
    ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m` 
    : content.episode_run_time?.[0] 
      ? `${Math.floor(content.episode_run_time[0] / 60)}h ${content.episode_run_time[0] % 60}m por episodio` 
      : "Duración desconocida";
  
  const trailer = videos.find(video => 
    video.site === "YouTube" && 
    (video.type === "Trailer" || video.type === "Teaser")
  );

  return (
    <>
      <ContentHeader 
        title={title}
        backdropPath={backdropPath}
        posterPath={posterPath}
        releaseYear={releaseYear}
        contentType={contentType}
        runtime={runtime}
        voteAverage={content.vote_average}
        isLoading={isLoading}
      />

      <div className="main-container">
        <div className="flex flex-col md:flex-row gap-6 mt-8 md:mt-0">
          <img 
            src={posterPath} 
            alt={title}
            className="md:hidden w-32 h-48 object-cover rounded-md shadow-lg mx-auto" 
          />
        
          <div className="md:ml-48 flex-grow">
            <ContentDetails 
              id={content.id}
              type={type}
              title={title}
              overview={content.overview}
              posterPath={content.poster_path}
              genres={content.genres}
            />

            <MediaPlayer trailer={trailer} />

            {/* For TV shows, display seasons and episodes */}
            {type === "tv" && id && (
              <div className="mb-8">
                <SeasonEpisodes tvId={id} />
              </div>
            )}

            <RelatedContent 
              title="Recomendaciones" 
              content={recommendedContent} 
            />

            <RelatedContent 
              title="Contenido Similar" 
              content={similarContent} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default TitlePage;
