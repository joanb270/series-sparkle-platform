
import { Content, Genre } from "@/types";

// Base URL for your Flask backend
const BASE_URL = "/api";

const fetchFromBackend = async (endpoint: string, params: Record<string, string> = {}) => {
  const url = new URL(`${BASE_URL}${endpoint}`, window.location.origin);
  
  // Add params to URL
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching from backend:", error);
    throw error;
  }
};

export const fetchTrendingContent = async (): Promise<Content[]> => {
  const data = await fetchFromBackend("/trending");
  return data.results || [];
};

export const fetchGenres = async (): Promise<Genre[]> => {
  const data = await fetchFromBackend("/genres");
  return data.genres || [];
};

export const searchContent = async (query: string): Promise<Content[]> => {
  const data = await fetchFromBackend("/search", { q: query });
  return data.results || [];
};

export const fetchContentDetails = async (id: string, type: string): Promise<any> => {
  return fetchFromBackend("/details", { id, type });
};

export const fetchSimilarContent = async (id: string, type: string): Promise<Content[]> => {
  const data = await fetchFromBackend("/recommendations", { id, type });
  return data.results?.map((item: any) => ({
    ...item,
    media_type: item.media_type || type
  })) || [];
};

export const fetchContentVideos = async (id: string, type: string): Promise<any[]> => {
  const data = await fetchFromBackend("/videos", { id, type });
  return data.results || [];
};

export const fetchRecommendedContent = async (id: string, type: string): Promise<Content[]> => {
  const data = await fetchFromBackend("/recommendations", { id, type });
  return data.results?.map((item: any) => ({
    ...item,
    media_type: item.media_type || type
  })) || [];
};

export const fetchSeasonDetails = async (tvId: string, seasonNumber: number): Promise<any> => {
  return fetchFromBackend("/episodes", { series_id: tvId, season: seasonNumber.toString() });
};

export const fetchTvSeasons = async (tvId: string): Promise<any> => {
  const data = await fetchFromBackend("/details", { id: tvId, type: 'tv' });
  return data.seasons || [];
};
