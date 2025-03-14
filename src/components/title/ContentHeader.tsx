
import React from "react";
import { ArrowLeft, Calendar, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface ContentHeaderProps {
  title: string;
  backdropPath: string;
  posterPath: string;
  releaseYear: string;
  contentType: string;
  runtime: string;
  voteAverage?: number;
  isLoading: boolean;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({
  title,
  backdropPath,
  posterPath,
  releaseYear,
  contentType,
  runtime,
  voteAverage,
  isLoading
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="relative h-[300px] md:h-[400px]">
        <div className="main-container relative h-full flex items-end pb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Skeleton className="hidden md:block w-48 h-72 rounded-md" />
            <div className="flex-grow">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mb-4"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Skeleton className="h-8 w-64" />
              <div className="flex flex-wrap gap-2 mt-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
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
              {voteAverage && (
                <span className="flex items-center text-sm">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" />
                  {(Math.round(voteAverage * 10) / 10).toFixed(1)}
                </span>
              )}
              <span className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {runtime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentHeader;
