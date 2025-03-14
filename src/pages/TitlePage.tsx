
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Calendar, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ContentCard from "@/components/ContentCard";
import { useToast } from "@/components/ui/use-toast";
import { fetchContentDetails, fetchSimilarContent, fetchContentVideos } from "@/lib/api";
import { Content, Video } from "@/types";

const TitlePage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const type = searchParams.get("type") || "movie";
  
  const [content, setContent] = useState<any>(null);
  const [similarContent, setSimilarContent] = useState<Content[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [contentData, similarData, videosData] = await Promise.all([
          fetchContentDetails(id, type),
          fetchSimilarContent(id, type),
          fetchContentVideos(id, type),
        ]);
        
        setContent(contentData);
        setSimilarContent(similarData);
        setVideos(videosData);
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
    return (
      <div className="main-container">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-64 ml-2" />
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="w-full md:w-80 h-[400px]" />
          <div className="flex-grow space-y-4">
            <Skeleton className="h-8 w-full max-w-md" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="main-container">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Contenido no encontrado</h2>
          <p className="text-muted-foreground mb-4">No pudimos encontrar el contenido que estás buscando.</p>
          <Button onClick={() => navigate("/")}>Volver al inicio</Button>
        </div>
      </div>
    );
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
      {/* Backdrop header */}
      <div 
        className="relative h-[300px] md:h-[400px] bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(26,31,44,1)), url(${backdropPath})` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="main-container relative h-full flex items-end pb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <img 
              src={posterPath} 
              alt={title}
              className="hidden md:block w-48 h-72 object-cover rounded-md shadow-lg -mb-24 relative z-10" 
            />
            <div className="flex-grow">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mb-4 bg-black/20 hover:bg-black/40"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                {releaseYear && (
                  <span className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {releaseYear}
                  </span>
                )}
                <span className="badge-primary">{contentType}</span>
                <span className="flex items-center text-sm">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" />
                  {content.vote_average ? (Math.round(content.vote_average * 10) / 10).toFixed(1) : "N/A"}
                </span>
                <span className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {runtime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-container">
        <div className="flex flex-col md:flex-row gap-6 mt-8 md:mt-0">
          <img 
            src={posterPath} 
            alt={title}
            className="md:hidden w-32 h-48 object-cover rounded-md shadow-lg mx-auto" 
          />
        
          <div className="md:ml-48 flex-grow">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Sinopsis</h2>
              <p className="text-muted-foreground">
                {content.overview || "No hay sinopsis disponible para este contenido."}
              </p>
            </div>

            {content.genres && content.genres.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Géneros</h2>
                <div className="flex flex-wrap gap-2">
                  {content.genres.map((genre: any) => (
                    <Link
                      key={genre.id}
                      to={`/?genre=${genre.id}`}
                      className="badge-primary"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {trailer && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Trailer</h2>
                <a 
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="gap-2">
                    <Play className="h-4 w-4" fill="currentColor" />
                    Ver Trailer
                  </Button>
                </a>
              </div>
            )}

            {similarContent.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Contenido Similar</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {similarContent.slice(0, 4).map((item) => (
                    <ContentCard key={item.id} content={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TitlePage;
