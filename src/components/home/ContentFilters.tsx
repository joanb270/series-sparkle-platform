
import React from "react";
import { Film, Tv, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Genre } from "@/types";

interface ContentFiltersProps {
  genres: Genre[];
  selectedGenres: number[];
  contentType: "all" | "movie" | "tv";
  onGenreToggle: (genreId: number) => void;
  onContentTypeChange: (type: "all" | "movie" | "tv") => void;
  onResetFilters: () => void;
}

const ContentFilters: React.FC<ContentFiltersProps> = ({
  genres,
  selectedGenres,
  contentType,
  onGenreToggle,
  onContentTypeChange,
  onResetFilters,
}) => {
  return (
    <section className="mb-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={contentType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onContentTypeChange("all")}
        >
          Todos
        </Button>
        <Button
          variant={contentType === "movie" ? "default" : "outline"}
          size="sm"
          onClick={() => onContentTypeChange("movie")}
          className="flex items-center gap-1"
        >
          <Film className="h-4 w-4" />
          Películas
        </Button>
        <Button
          variant={contentType === "tv" ? "default" : "outline"}
          size="sm"
          onClick={() => onContentTypeChange("tv")}
          className="flex items-center gap-1"
        >
          <Tv className="h-4 w-4" />
          Series
        </Button>

        <div className="relative ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById("genreDropdown")?.classList.toggle("hidden");
            }}
          >
            Géneros
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div
            id="genreDropdown"
            className="hidden absolute right-0 mt-1 w-64 p-2 bg-card rounded-md shadow-lg z-10 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap gap-1">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => onGenreToggle(genre.id)}
                  className={`badge-primary ${
                    selectedGenres.includes(genre.id)
                      ? "bg-primary"
                      : "bg-secondary"
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentFilters;
