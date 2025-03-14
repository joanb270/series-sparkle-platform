
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Content } from "@/types";

interface ContentCarouselProps {
  items: Content[];
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    let interval: number | null = null;
    
    if (isAutoPlaying) {
      interval = window.setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying, items.length]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  if (!items.length) return null;

  const currentItem = items[currentIndex];
  const title = currentItem.title || currentItem.name || "Unknown Title";
  const backdrop = currentItem.backdrop_path
    ? `https://image.tmdb.org/t/p/original${currentItem.backdrop_path}`
    : "/placeholder.svg";
  const overview = currentItem.overview || "No description available";
  const mediaType = currentItem.media_type === "movie" ? "Película" : "Serie";
  const releaseYear = (currentItem.release_date || currentItem.first_air_date || "").substring(0, 4);

  return (
    <div className="relative">
      <div className="carousel-item">
        <img src={backdrop} alt={title} className="carousel-backdrop" />
        <div className="carousel-overlay">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-4xl font-bold mb-1">{title}</h2>
            <div className="flex items-center text-sm mb-2">
              <span className="badge-primary">{mediaType}</span>
              {releaseYear && <span className="text-muted-foreground">{releaseYear}</span>}
            </div>
            <p className="text-sm md:text-base text-muted-foreground line-clamp-2 md:line-clamp-3 mb-4">
              {overview}
            </p>
            <Link to={`/title/${currentItem.id}?type=${currentItem.media_type}`}>
              <Button className="gap-2">
                <Play className="h-4 w-4" fill="currentColor" />
                Ver Ahora
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-5 right-5 flex gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-black/50 hover:bg-black/70"
          onClick={handlePrev}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full bg-black/50 hover:bg-black/70"
          onClick={handleNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-1">
        {items.map((_, i) => (
          <button
            key={i}
            className={`w-2 h-2 rounded-full ${
              i === currentIndex ? "bg-primary" : "bg-white/50"
            }`}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentIndex(i);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ContentCarousel;
