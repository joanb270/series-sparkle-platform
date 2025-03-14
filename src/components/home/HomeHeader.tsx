
import React from "react";
import SearchBar from "./SearchBar";

interface HomeHeaderProps {
  onSearchQueryChange: (query: string) => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ onSearchQueryChange }) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
      <h1 className="text-2xl md:text-3xl font-bold">Películas y Series Gratis</h1>
      <SearchBar onSearchQueryChange={onSearchQueryChange} />
    </header>
  );
};

export default HomeHeader;
