
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, X, Film, Tv, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ContentCard from "@/components/ContentCard";
import ContentCarousel from "@/components/ContentCarousel";
import { useToast } from "@/components/ui/use-toast";
import { fetchTrendingContent, fetchGenres, searchContent } from "@/lib/api";
import { Content, Genre } from "@/types";

const HomePage = () => {
  const { toast } = useToast();
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [filteredContent, setFilteredContent] = useState<Content[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [contentType, setContentType] = useState<"all" | "movie" | "tv">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Content[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [trendingData, genresData] = await Promise.all([
          fetchTrendingContent(),
          fetchGenres(),
        ]);
        setTrendingContent(trendingData);
        setFilteredContent(trendingData);
        setGenres(genresData);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load content. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [toast]);

  useEffect(() => {
    // Filter content based on selected genres and type
    let filtered = [...trendingContent];
    
    // Filter by type
    if (contentType !== "all") {
      filtered = filtered.filter((item) => item.media_type === contentType);
    }
    
    // Filter by genres
    if (selectedGenres.length > 0) {
      filtered = filtered.filter((item) => 
        item.genre_ids?.some((genreId) => selectedGenres.includes(genreId))
      );
    }
    
    setFilteredContent(filtered);
  }, [trendingContent, selectedGenres, contentType]);

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.length >= 2) {
        try {
          const results = await searchContent(searchQuery);
          setSearchResults(results);
          setShowSearchResults(true);
        } catch (error) {
          console.error("Search error:", error);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    };

    const debounce = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const toggleGenre = (genreId: number) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
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
    <div className="main-container">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Películas y Series Gratis</h1>
        
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
      </header>

      {/* Carousel */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">En Tendencia</h2>
        {isLoading ? (
          <Skeleton className="carousel-item rounded-lg" />
        ) : (
          <ContentCarousel items={trendingContent.slice(0, 5)} />
        )}
      </section>

      {/* Filters */}
      <section className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={contentType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setContentType("all")}
          >
            Todos
          </Button>
          <Button
            variant={contentType === "movie" ? "default" : "outline"}
            size="sm"
            onClick={() => setContentType("movie")}
            className="flex items-center gap-1"
          >
            <Film className="h-4 w-4" />
            Películas
          </Button>
          <Button
            variant={contentType === "tv" ? "default" : "outline"}
            size="sm"
            onClick={() => setContentType("tv")}
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
                    onClick={() => toggleGenre(genre.id)}
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

      {/* Content Grid */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {contentType === "all" 
            ? "Todo el Contenido" 
            : contentType === "movie" 
              ? "Películas" 
              : "Series"}
        </h2>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-[180px] w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredContent.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredContent.map((item) => (
              <ContentCard key={`${item.id}-${item.media_type}`} content={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron resultados con los filtros seleccionados.</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSelectedGenres([]);
                setContentType("all");
              }}
            >
              Resetear filtros
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
