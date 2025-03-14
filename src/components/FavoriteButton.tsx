
import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface FavoriteButtonProps {
  contentId: number;
  contentType: string;
  contentTitle: string;
  posterPath?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  contentId,
  contentType,
  contentTitle,
  posterPath,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.some((fav: any) => fav.id === contentId && fav.media_type === contentType));
  }, [contentId, contentType]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter(
        (fav: any) => !(fav.id === contentId && fav.media_type === contentType)
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setIsFavorite(false);
      toast({
        title: "Eliminado de favoritos",
        description: `${contentTitle} ha sido eliminado de tus favoritos`,
      });
    } else {
      // Add to favorites
      const newFavorite = {
        id: contentId,
        media_type: contentType,
        title: contentTitle,
        poster_path: posterPath,
        added_at: new Date().toISOString(),
      };
      localStorage.setItem("favorites", JSON.stringify([...favorites, newFavorite]));
      setIsFavorite(true);
      toast({
        title: "Añadido a favoritos",
        description: `${contentTitle} ha sido añadido a tus favoritos`,
      });
    }
  };

  return (
    <Button
      onClick={toggleFavorite}
      variant={isFavorite ? "default" : "outline"}
      className="gap-2"
    >
      <Heart
        className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
      />
      {isFavorite ? "En favoritos" : "Añadir a favoritos"}
    </Button>
  );
};

export default FavoriteButton;
