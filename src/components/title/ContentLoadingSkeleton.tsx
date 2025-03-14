
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const ContentLoadingSkeleton: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="main-container">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Skeleton className="h-8 w-64 ml-2" />
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <Skeleton className="w-full md:w-80 h-[400px]" />
        <div className="flex-grow space-y-4">
          <Skeleton className="h-8 w-full max-w-md" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
};

export default ContentLoadingSkeleton;
