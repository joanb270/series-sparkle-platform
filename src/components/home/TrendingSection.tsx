
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ContentCarousel from "@/components/ContentCarousel";
import { Content } from "@/types";

interface TrendingSectionProps {
  isLoading: boolean;
  trendingContent: Content[];
}

const TrendingSection: React.FC<TrendingSectionProps> = ({
  isLoading,
  trendingContent,
}) => {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-4">En Tendencia</h2>
      {isLoading ? (
        <Skeleton className="carousel-item rounded-lg" />
      ) : (
        <ContentCarousel items={trendingContent.slice(0, 5)} />
      )}
    </section>
  );
};

export default TrendingSection;
