
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { fetchTrendingContent, fetchGenres } from "@/lib/api";
import { Content, Genre } from "@/types";

// Import refactored components
import HomeHeader from "@/components/home/HomeHeader";
import TrendingSection from "@/components/home/TrendingSection";
import ContentFilters from "@/components/home/ContentFilters";
import ContentGrid from "@/components/home/ContentGrid";

const HomePage = () => {
  const { toast } = useToast();
  const [trendingContent, setTrendingContent] = useState<Content[]>([]);
  const [filteredContent, setFilteredContent] = useState<Content[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [contentType, setContentType] = useState<"all" | "movie" | "tv">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const toggleGenre = (genreId: number) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const resetFilters = () => {
    setSelectedGenres([]);
    setContentType("all");
  };

  return (
    <div className="main-container">
      <HomeHeader onSearchQueryChange={handleSearchQueryChange} />
      
      <TrendingSection 
        isLoading={isLoading} 
        trendingContent={trendingContent} 
      />
      
      <ContentFilters 
        genres={genres}
        selectedGenres={selectedGenres}
        contentType={contentType}
        onGenreToggle={toggleGenre}
        onContentTypeChange={setContentType}
        onResetFilters={resetFilters}
      />
      
      <ContentGrid 
        contentType={contentType}
        isLoading={isLoading}
        filteredContent={filteredContent}
        onResetFilters={resetFilters}
      />
    </div>
  );
};

export default HomePage;
