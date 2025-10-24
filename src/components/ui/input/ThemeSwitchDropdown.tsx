"use client";

import { siteConfig } from "@/config/site";
import { Button } from "@heroui/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const themes = siteConfig.themes;

interface ThemeSwitchDropdownProps {
  section?: 'movie' | 'tv' | 'anime';
  isLandingPage?: boolean;
}

const ThemeSwitchDropdown = ({ section, isLandingPage }: ThemeSwitchDropdownProps) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const themeIcon = themes.find(({ name }) => name === theme)?.icon;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Section-specific colors
  const getSectionColor = () => {
    if (theme === "light") {
      return "warning"; // Keep light theme as warning (yellow)
    }
    
    // Landing page always uses blue
    if (isLandingPage) {
      return "primary"; // Blue for landing page
    }
    
    // Dark theme colors based on section
    switch (section) {
      case 'movie':
        return "primary"; // Blue for movies
      case 'tv':
        return "warning"; // Yellow for TV shows
      case 'anime':
        return "danger"; // Red for anime
      default:
        return "primary"; // Default blue
    }
  };

  const color = getSectionColor();

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(({ name }) => name === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].name);
  };

  return (
    <Button 
      isIconOnly 
      variant="light" 
      color={color} 
      className="p-2"
      onPress={cycleTheme}
      title={`Current: ${theme}. Click to cycle themes`}
    >
      {themeIcon}
    </Button>
  );
};

export default ThemeSwitchDropdown;
