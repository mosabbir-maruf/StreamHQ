"use client";

import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { ContentType } from "@/types";
import { Movie, TV, Anime } from "@/utils/icons";
import { Tabs, Tab, TabsProps } from "@heroui/react";
import { useState, useEffect } from "react";
import { getSpinnerColor } from "@/utils/spinner";

interface ContentTypeSelectionProps extends TabsProps {
  onTypeChange?: (type: ContentType) => void;
}

const ContentTypeSelection: React.FC<ContentTypeSelectionProps> = ({ onTypeChange, ...props }) => {
  const { content, setContent, resetFilters } = useDiscoverFilters();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleTabChange = (key: ContentType) => {
    resetFilters();
    setContent(key);
    onTypeChange?.(key);
  };


  // Show loading state until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60px]">
        <div className="animate-pulse bg-gray-200 rounded h-10 w-64"></div>
      </div>
    );
  }

  return (
    <Tabs
      size="lg"
      variant="underlined"
      selectedKey={content}
      aria-label="Content Type Selection"
      color={getSpinnerColor(content)}
      onSelectionChange={(value) => handleTabChange(value as ContentType)}
      classNames={{
        tabContent: "pb-2",
        cursor: "h-1 rounded-full",
      }}
      {...props}
    >
      <Tab
        key="movie"
        title={
          <div className="flex items-center space-x-2">
            <Movie />
            <span>Movies</span>
          </div>
        }
      />
      <Tab
        key="tv"
        title={
          <div className="flex items-center space-x-2">
            <TV />
            <span>TV Series</span>
          </div>
        }
      />
      <Tab
        key="anime"
        title={
          <div className="flex items-center space-x-2">
            <Anime />
            <span>Anime</span>
          </div>
        }
      />
    </Tabs>
  );
};

export default ContentTypeSelection;
