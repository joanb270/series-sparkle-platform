
import React from "react";
import { Content } from "@/types";
import ContentCard from "@/components/ContentCard";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";

interface RelatedContentProps {
  title: string;
  content: Content[];
}

const RelatedContent: React.FC<RelatedContentProps> = ({ title, content }) => {
  if (content.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <Carousel className="w-full">
        <CarouselContent>
          {content.map((item) => (
            <CarouselItem key={item.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <ContentCard content={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default RelatedContent;
