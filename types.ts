// Fix: Removed self-import of 'Movie' which caused a conflict with the local declaration.
export interface Movie {
  title: string;
  releaseDate: string; // YYYY-MM-DD
  posterUrl: string;
  genres: string[];
  cast: string[];
  tag?: {
    text: string;
    color: string; // e.g., 'bg-red-500'
  };
}
