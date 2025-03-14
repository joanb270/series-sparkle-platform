
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchContent } from "@/lib/api";
import { Content } from "@/types";

interface SearchBarProps {
  onSearchQueryChange: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchQueryChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Content[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.length >= 2) {
        try {
          const results = await searchContent(searchQuery);
          setSearchResults(results);
          setShowSearchResults(true);
          onSearchQueryChange(searchQuery);
        } catch (error) {
          console.error("Search error:", error);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
        onSearchQueryChange("");
      }
    };

    const debounce = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery, onSearchQueryChange]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
    onSearchQueryChange("");
  };

  const handleClickOutside = () => {
    setShowSearchResults(false);
  };

  useEffect(() => {
    if (showSearchResults) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showSearchResults]);

  return (
    <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar películas y series..."
          className="pl-10 pr-10"
          value={searchQuery}
          onChange={handleSearchInputChange}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {showSearchResults && searchResults.length > 0 && (
        <div className="search-result-dropdown">
          {searchResults.slice(0, 5).map((result) => (
            <Link 
              key={result.id}
              to={`/title/${result.id}?type=${result.media_type}`}
              className="search-result-item"
            >
              <img 
                src={result.poster_path 
                  ? `https://image.tmdb.org/t/p/w92${result.poster_path}`
                  : "/placeholder.svg"
                } 
                alt={result.title || result.name}
              />
              <div>
                <p className="font-medium truncate">{result.title || result.name}</p>
                <p className="text-xs text-muted-foreground">
                  {result.media_type === "movie" ? "Película" : "Serie"} • 
                  {" "}
                  {result.release_date?.substring(0, 4) || 
                   result.first_air_date?.substring(0, 4) || "N/A"}
                </p>
              </div>
            </Link>
          ))}
          <Link 
            to={`/search?q=${encodeURIComponent(searchQuery)}`}
            className="block p-2 text-center text-primary hover:underline"
          >
            Ver todos los resultados
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
