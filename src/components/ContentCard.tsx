
import React from "react";
import { Link } from "react-router-dom";
import { Star, Calendar } from "lucide-react";
import { Content } from "@/types";

interface ContentCardProps {
  content: Content;
}

const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  const {
    id,
    media_type,
    title,
    name,
    poster_path,
    vote_average,
    release_date,
    first_air_date,
  } = content;

  const contentTitle = title || name || "Unknown Title";
  const releaseYear = (release_date || first_air_date || "").substring(0, 4);
  const rating = vote_average ? Math.round(vote_average * 10) / 10 : "N/A";
  const imagePath = poster_path
    ? `https://image.tmdb.org/t/p/w300${poster_path}`
    : "/placeholder.svg";

  return (
    <Link to={`/title/${id}?type=${media_type}`} className="content-card">
      <div className="aspect-[2/3] bg-muted rounded-md overflow-hidden">
        <img src={imagePath} alt={contentTitle} loading="lazy" />
      </div>
      
      <div className="content-card-overlay">
        <h3 className="text-sm font-medium truncate">{contentTitle}</h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
          <span className="flex items-center">
            <Star className="h-3 w-3 text-yellow-400 mr-1 inline" fill="currentColor" />
            {rating}
          </span>
          {releaseYear && (
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 inline" />
              {releaseYear}
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-2">
        <h3 className="text-sm font-medium truncate">{contentTitle}</h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{media_type === "movie" ? "Película" : "Serie"}</span>
          {releaseYear && <span>{releaseYear}</span>}
        </div>
      </div>
    </Link>
  );
};

export default ContentCard;
