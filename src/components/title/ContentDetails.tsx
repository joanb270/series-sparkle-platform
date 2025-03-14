
import React from "react";
import { Link } from "react-router-dom";
import FavoriteButton from "@/components/FavoriteButton";
import { Genre } from "@/types";

interface ContentDetailsProps {
  id: number;
  type: string;
  title: string;
  overview: string;
  posterPath?: string;
  genres?: Genre[];
}

const ContentDetails: React.FC<ContentDetailsProps> = ({
  id,
  type,
  title,
  overview,
  posterPath,
  genres
}) => {
  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Sinopsis</h2>
          <FavoriteButton 
            contentId={id} 
            contentType={type}
            contentTitle={title}
            posterPath={posterPath}
          />
        </div>
        <p className="text-muted-foreground">
          {overview || "No hay sinopsis disponible para este contenido."}
        </p>
      </div>

      {genres && genres.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Géneros</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
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
    </div>
  );
};

export default ContentDetails;
