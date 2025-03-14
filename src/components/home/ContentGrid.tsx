
import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ContentCard from "@/components/ContentCard";
import { Content } from "@/types";

interface ContentGridProps {
  contentType: "all" | "movie" | "tv";
  isLoading: boolean;
  filteredContent: Content[];
  onResetFilters: () => void;
}

const ContentGrid: React.FC<ContentGridProps> = ({
  contentType,
  isLoading,
  filteredContent,
  onResetFilters,
}) => {
  return (
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
            onClick={onResetFilters}
          >
            Resetear filtros
          </Button>
        </div>
      )}
    </section>
  );
};

export default ContentGrid;
