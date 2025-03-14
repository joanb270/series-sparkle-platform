
import { Content, Genre } from "@/types";

const API_KEY = "c7f9f5bd40f5f95ebf63df8efcde3c46"; // This is a public API key for demo purposes
const BASE_URL = "https://api.themoviedb.org/3";

const fetchFromTMDB = async (endpoint: string, params: Record<string, string> = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  // Add API key and other params
  url.searchParams.append("api_key", API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching from TMDB:", error);
    throw error;
  }
};

export const fetchTrendingContent = async (): Promise<Content[]> => {
  const data = await fetchFromTMDB("/trending/all/week");
  return data.results;
};

export const fetchGenres = async (): Promise<Genre[]> => {
  const [movieGenres, tvGenres] = await Promise.all([
    fetchFromTMDB("/genre/movie/list"),
    fetchFromTMDB("/genre/tv/list")
  ]);
  
  // Combine and deduplicate genres
  const allGenres = [...movieGenres.genres, ...tvGenres.genres];
  const uniqueGenres = Array.from(
    new Map(allGenres.map(genre => [genre.id, genre])).values()
  );
  
  return uniqueGenres;
};

export const searchContent = async (query: string): Promise<Content[]> => {
  const data = await fetchFromTMDB("/search/multi", { query });
  return data.results.filter(
    (item: any) => item.media_type === "movie" || item.media_type === "tv"
  );
};

export const fetchContentDetails = async (id: string, type: string): Promise<any> => {
  return fetchFromTMDB(`/${type}/${id}`);
};

export const fetchSimilarContent = async (id: string, type: string): Promise<Content[]> => {
  const data = await fetchFromTMDB(`/${type}/${id}/similar`);
  return data.results.map((item: any) => ({
    ...item,
    media_type: type
  }));
};

export const fetchContentVideos = async (id: string, type: string): Promise<any[]> => {
  const data = await fetchFromTMDB(`/${type}/${id}/videos`);
  return data.results;
};

export const fetchRecommendedContent = async (id: string, type: string): Promise<Content[]> => {
  const data = await fetchFromTMDB(`/${type}/${id}/recommendations`);
  return data.results.map((item: any) => ({
    ...item,
    media_type: item.media_type || type
  }));
};

export const fetchSeasonDetails = async (tvId: string, seasonNumber: number): Promise<any> => {
  return fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
};

export const fetchTvSeasons = async (tvId: string): Promise<any> => {
  const data = await fetchFromTMDB(`/tv/${tvId}`);
  return data.seasons || [];
};
