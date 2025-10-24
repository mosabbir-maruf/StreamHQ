"use client";

import { useState, useTransition } from "react";
import { addToast, Tooltip } from "@heroui/react";
import { Check, Close } from "@/utils/icons";
import { toggleDoneStatus } from "@/actions/library";
import { queryClient } from "@/app/providers";

interface MarkAsDoneButtonProps {
  id: number;
  type: "movie" | "tv" | "anime";
  title: string;
  done: boolean;
  variant?: "icon" | "button";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const MarkAsDoneButton: React.FC<MarkAsDoneButtonProps> = ({
  id,
  type,
  title,
  done,
  variant = "icon",
  size = "sm",
  className = "",
}) => {
  const [isPending, startTransition] = useTransition();

  const handleToggleDone = () => {
    startTransition(async () => {
      try {
        const result = await toggleDoneStatus(id, type, done);

        if (result.success) {
          const colors = getContentTypeColors();
          addToast({
            title: done 
              ? `"${title}" marked as not done and moved back to watchlist!` 
              : `"${title}" marked as done and added to completed list!`,
            color: colors.color as any,
            icon: done ? <Close /> : <Check />,
          });

          // Invalidate and refetch watchlist cache
          queryClient.invalidateQueries({ queryKey: ["watchlist"] });
          queryClient.refetchQueries({ 
            queryKey: ["watchlist"],
            type: 'active'
          });
        } else {
          addToast({
            title: "Error",
            description: result.error || "Failed to update done status",
            color: "danger",
          });
        }
      } catch (error) {
        addToast({
          title: "Error",
          description: "An unexpected error occurred",
          color: "danger",
        });
      }
    });
  };

  const getContentTypeLabel = () => {
    switch (type) {
      case "movie":
        return "movie";
      case "tv":
        return "TV show";
      case "anime":
        return "anime";
      default:
        return "item";
    }
  };

  const getContentTypeColors = () => {
    switch (type) {
      case "movie":
        return {
          color: "primary",
          bgColor: done ? "bg-success-500/90" : "bg-primary-500/90",
          hoverColor: done ? "hover:bg-success-600" : "hover:bg-primary-600",
          tooltipColor: done ? "success" : "primary"
        };
      case "tv":
        return {
          color: "warning",
          bgColor: done ? "bg-success-500/90" : "bg-warning-500/90",
          hoverColor: done ? "hover:bg-success-600" : "hover:bg-warning-600",
          tooltipColor: done ? "success" : "warning"
        };
      case "anime":
        return {
          color: "danger",
          bgColor: done ? "bg-success-500/90" : "bg-danger-500/90",
          hoverColor: done ? "hover:bg-success-600" : "hover:bg-danger-600",
          tooltipColor: done ? "success" : "danger"
        };
      default:
        return {
          color: "success",
          bgColor: "bg-success-500/90",
          hoverColor: "hover:bg-success-600",
          tooltipColor: "success"
        };
    }
  };

  if (variant === "icon") {
    const colors = getContentTypeColors();
    
    return (
      <Tooltip
        content={done ? `Mark "${title}" as not done` : `Mark "${title}" as done`}
        placement="top"
        showArrow
        color={colors.tooltipColor as any}
      >
        <button
          onClick={handleToggleDone}
          disabled={isPending}
          className={`
            min-w-8 w-8 h-8 rounded-lg flex items-center justify-center
            ${colors.bgColor} ${colors.hoverColor} 
            transition-all duration-200 hover:scale-110 
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          aria-label={done ? `Mark ${title} as not done` : `Mark ${title} as done`}
        >
          {isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : done ? (
            <Close className="w-4 h-4 text-white" />
          ) : (
            <Check className="w-4 h-4 text-white" />
          )}
        </button>
      </Tooltip>
    );
  }

  const colors = getContentTypeColors();
  
  return (
    <button
      onClick={handleToggleDone}
      disabled={isPending}
      className={`
        px-4 py-2 rounded-lg flex items-center gap-2
        ${colors.bgColor} ${colors.hoverColor} 
        transition-all duration-200 hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed
        text-white font-medium
        ${className}
      `}
    >
      {isPending ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : done ? (
        <>
          <Close className="w-4 h-4" />
          Mark as Not Done
        </>
      ) : (
        <>
          <Check className="w-4 h-4" />
          Mark as Done
        </>
      )}
    </button>
  );
};

export default MarkAsDoneButton;
