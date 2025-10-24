"use client";

import { useState, useTransition } from "react";
import { addToast, Tooltip } from "@heroui/react";
import { Trash } from "@/utils/icons";
import { removeFromWatchlist } from "@/actions/library";
import { queryClient } from "@/app/providers";
import { Button } from "@heroui/react";
import { useDisclosure } from "@mantine/hooks";
import ConfirmationModal from "@/components/ui/overlay/ConfirmationModal";

interface DeleteWatchlistButtonProps {
  id: number;
  type: "movie" | "tv" | "anime";
  title: string;
  variant?: "icon" | "button";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const DeleteWatchlistButton: React.FC<DeleteWatchlistButtonProps> = ({
  id,
  type,
  title,
  variant = "icon",
  size = "sm",
  className = "",
}) => {
  const [isPending, startTransition] = useTransition();
  const [opened, { open, close }] = useDisclosure(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await removeFromWatchlist(id, type);

        if (result.success) {
          const colors = getContentTypeColors();
          addToast({
            title: `Removed "${title}" from your watchlist!`,
            color: colors.color as any,
            icon: <Trash />,
          });

          // Invalidate and refetch watchlist cache
          queryClient.invalidateQueries({ queryKey: ["watchlist"] });
          queryClient.refetchQueries({ 
            queryKey: ["watchlist"],
            type: 'active'
          });

          close();
        } else {
          addToast({
            title: "Error",
            description: result.error || "Failed to remove from watchlist",
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

  const getFriendlyMessage = () => {
    const contentType = getContentTypeLabel();
    return {
      title: `Remove ${contentType} from your watchlist?`,
      description: `Are you sure you want to remove "${title}" from your watchlist?`,
      warning: "This action cannot be undone, but you can always add it back later!",
      confirmText: "Yes, remove it",
      cancelText: "Keep it"
    };
  };

  const getContentTypeColors = () => {
    switch (type) {
      case "movie":
        return {
          color: "primary",
          bgColor: "bg-primary-500/90",
          hoverColor: "hover:bg-primary-600",
          tooltipColor: "primary"
        };
      case "tv":
        return {
          color: "warning",
          bgColor: "bg-warning-500/90",
          hoverColor: "hover:bg-warning-600",
          tooltipColor: "warning"
        };
      case "anime":
        return {
          color: "danger",
          bgColor: "bg-danger-500/90",
          hoverColor: "hover:bg-danger-600",
          tooltipColor: "danger"
        };
      default:
        return {
          color: "danger",
          bgColor: "bg-danger-500/90",
          hoverColor: "hover:bg-danger-600",
          tooltipColor: "danger"
        };
    }
  };

  if (variant === "icon") {
    const friendlyMessage = getFriendlyMessage();
    const colors = getContentTypeColors();
    
    return (
      <>
        <Tooltip
          content={`Remove "${title}" from watchlist`}
          placement="top"
          showArrow
          color={colors.tooltipColor as any}
        >
          <Button
            isIconOnly
            size={size}
            color={colors.color as any}
            variant="shadow"
            onPress={open}
            isLoading={isPending}
            className={`min-w-8 w-8 h-8 ${colors.bgColor} ${colors.hoverColor} transition-all duration-200 hover:scale-110 ${className}`}
            aria-label={`Remove ${title} from watchlist`}
          >
            <Trash />
          </Button>
        </Tooltip>

        <ConfirmationModal
          title={friendlyMessage.title}
          isOpen={opened}
          onClose={close}
          onConfirm={handleDelete}
          confirmLabel={friendlyMessage.confirmText}
          cancelLabel={friendlyMessage.cancelText}
          isLoading={isPending}
        >
          <div className="space-y-3">
            <p className="text-foreground">
              {friendlyMessage.description}
            </p>
            <p className="text-default-500 text-sm">
              {friendlyMessage.warning}
            </p>
          </div>
        </ConfirmationModal>
      </>
    );
  }

  const friendlyMessage = getFriendlyMessage();
  const colors = getContentTypeColors();
  
  return (
    <>
      <Button
        size={size}
        color={colors.color as any}
        variant="shadow"
        startContent={<Trash />}
        onPress={open}
        isLoading={isPending}
        className={`${colors.bgColor} ${colors.hoverColor} transition-all duration-200 hover:scale-105 ${className}`}
      >
        Remove
      </Button>

      <ConfirmationModal
        title={friendlyMessage.title}
        isOpen={opened}
        onClose={close}
        onConfirm={handleDelete}
        confirmLabel={friendlyMessage.confirmText}
        cancelLabel={friendlyMessage.cancelText}
        isLoading={isPending}
      >
        <div className="space-y-3">
          <p className="text-foreground">
            {friendlyMessage.description}
          </p>
          <p className="text-default-500 text-sm">
            {friendlyMessage.warning}
          </p>
        </div>
      </ConfirmationModal>
    </>
  );
};

export default DeleteWatchlistButton;
