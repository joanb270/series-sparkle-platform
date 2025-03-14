
export interface Content {
  id: number;
  media_type: string;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface Episode {
  id: number;
  name: string;
  episode_number: number;
  air_date?: string;
  overview?: string;
  still_path?: string;
  runtime?: number;
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date?: string;
  overview?: string;
  poster_path?: string;
  episodes?: Episode[];
}
