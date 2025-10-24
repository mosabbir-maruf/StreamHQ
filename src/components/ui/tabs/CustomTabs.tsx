"use client";

import React, { useState } from "react";
import { cn } from "@/utils/helpers";

interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface CustomTabsProps {
  items: TabItem[];
  defaultValue?: string;
  variant?: "default" | "line" | "button";
  size?: "sm" | "md" | "lg";
  className?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const CustomTabs: React.FC<CustomTabsProps> = ({
  items,
  defaultValue,
  variant = "line",
  size = "md",
  className,
  onValueChange,
  children,
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue || items[0]?.key);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    onValueChange?.(key);
  };

  const getTabListClasses = () => {
    const base = "grid grid-cols-3 gap-3";
    
    switch (variant) {
      case "line":
        return cn(base, "border-b border-divider pb-1");
      case "button":
        return cn(base, "bg-default-100 p-1 rounded-lg");
      default:
        return cn(base, "bg-default-100 p-1 rounded-lg");
    }
  };

  const getTabClasses = (isActive: boolean) => {
    const base = "flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 font-medium transition-colors cursor-pointer relative";
    
    const sizeClasses = {
      sm: "text-xs py-1 px-2 sm:py-1 sm:px-3",
      md: "text-xs sm:text-sm py-1 sm:py-1 px-3 sm:px-4", 
      lg: "text-sm sm:text-base py-1 sm:py-1 px-4 sm:px-5"
    };

    switch (variant) {
      case "line":
        return cn(
          base,
          sizeClasses[size],
          "text-foreground-500 hover:text-foreground",
          isActive && "text-foreground"
        );
      case "button":
        return cn(
          base,
          sizeClasses[size],
          "rounded-md",
          isActive
            ? "bg-background text-foreground shadow-sm"
            : "text-foreground-500 hover:text-foreground hover:bg-default-200"
        );
      default:
        return cn(
          base,
          sizeClasses[size],
          "rounded-md",
          isActive
            ? "bg-background text-foreground shadow-sm"
            : "text-foreground-500 hover:text-foreground hover:bg-default-200"
        );
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={getTabListClasses()}>
        {items.map((item) => (
          <div
            key={item.key}
            className={getTabClasses(activeTab === item.key)}
            onClick={() => handleTabChange(item.key)}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span className={cn(
              "flex items-center justify-center h-full",
              activeTab === item.key && variant === "line" && "border-b-2 border-primary"
            )}>{item.label}</span>
            {item.badge && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-danger text-danger-foreground rounded-full min-w-[1.25rem] text-center">
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-0">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && (child.props as any).value === activeTab) {
            return child;
          }
          return null;
        })}
      </div>
    </div>
  );
};

interface TabContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabContent: React.FC<TabContentProps> = ({ value, children, className }) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
};

export { CustomTabs, TabContent };
