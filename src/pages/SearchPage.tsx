
import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ContentCard from "@/components/ContentCard";
import { useToast } from "@/components/ui/use-toast";
import { searchContent } from "@/lib/api";
import { Content } from "@/types";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { toast } = useToast();
  
  const [searchResults, setSearchResults] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);
  const [contentType, setContentType] = useState<"all" | "movie" | "tv">("all");

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      try {
        setIsLoading(true);
        const results = await searchContent(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load search results. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    setSearchQuery(query);
    fetchResults();
  }, [query, toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const filteredResults = searchResults.filter(
    item => contentType === "all" || item.media_type === contentType
  );

  return (
    <div className="main-container">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Resultados de búsqueda</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar películas y series..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
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
          >
            Películas
          </Button>
          <Button
            variant={contentType === "tv" ? "default" : "outline"}
            size="sm"
            onClick={() => setContentType("tv")}
          >
            Series
          </Button>
        </div>
        
        {query && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">Resultados para:</span>
            <span className="badge-primary flex items-center">
              {query}
              <Link to="/search">
                <X className="h-3 w-3 ml-1" />
              </Link>
            </span>
          </div>
        )}
      </div>

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
      ) : filteredResults.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredResults.map((item) => (
            <ContentCard key={`${item.id}-${item.media_type}`} content={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {query ? (
            <>
              <h2 className="text-xl font-semibold mb-2">No se encontraron resultados</h2>
              <p className="text-muted-foreground">
                No encontramos nada para "{query}". Intenta con otro término de búsqueda.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-2">Realiza una búsqueda</h2>
              <p className="text-muted-foreground">
                Escribe en el campo de búsqueda para encontrar películas y series.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
