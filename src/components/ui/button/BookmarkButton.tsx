"use client";

import { useEffect, useState, useTransition } from "react";
import { BsBookmarkCheckFill, BsBookmarkFill } from "react-icons/bs";
import { addToast } from "@heroui/react";
import IconButton from "./IconButton";
import { Trash, Check, Close } from "@/utils/icons";
import useDeviceVibration from "@/hooks/useDeviceVibration";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import { SavedMovieDetails } from "@/types/movie";
import { addToWatchlist, removeFromWatchlist, checkInWatchlist, markAsDone, addToDoneList } from "@/actions/library";
import { queryClient } from "@/app/providers";
import { usePathname } from "next/navigation";

interface BookmarkButtonProps {
  data: SavedMovieDetails;
  isTooltipDisabled?: boolean;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ data, isTooltipDisabled }) => {
  const pathname = usePathname();
  const { startVibration } = useDeviceVibration();
  const { data: user, isLoading: isUserLoading } = useSupabaseUser();
  const [isBookmarkPending, startBookmarkTransition] = useTransition();
  const [isDonePending, startDoneTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (!user) {
        setIsChecking(false);
        setIsSaved(false);
        return;
      }

      setIsChecking(true);
      try {
        const result = await checkInWatchlist(data.id, data.type);
        if (result.success) {
          setIsSaved(result.isInWatchlist);
          setIsDone(!!result.done);
        }
      } catch (error) {
        // Error checking watchlist status
      } finally {
        setIsChecking(false);
      }
    };

    checkWatchlistStatus();
  }, [user, data.id, data.type]);

  const getContentTypeColors = () => {
    switch (data.type) {
      case "movie":
        return "primary";
      case "tv":
        return "warning";
      case "anime":
        return "danger";
      default:
        return "success";
    }
  };

  const handleMarkAsDone = () => {
    if (!user) {
      addToast({
        title: "You must be logged in to use this feature",
        color: "warning",
      });
      return;
    }

    startDoneTransition(async () => {
      try {
        if (isDone) {
          // Item is currently marked as done, so we need to unmark it
          const result = await markAsDone(data.id, data.type, false);

          if (result.success) {
            setIsDone(false);
            startVibration([100]);
            addToast({
              title: `${data.title} marked as not done and removed from completed list!`,
              color: getContentTypeColors(),
            });
          } else {
            addToast({
              title: "Error",
              description: result.error || "Failed to remove from completed list",
              color: "danger",
            });
            return;
          }
        } else {
          // Item is not marked as done, so we need to mark it as done
          if (!isSaved) {
            // Not in watchlist, add directly to completed list
            const item = {
              id: data.id,
              type: data.type,
              adult: data.adult,
              backdrop_path: data.backdrop_path,
              poster_path: data.poster_path || null,
              release_date: data.release_date,
              title: data.title,
              vote_average: data.vote_average,
            };

            const addDoneResult = await addToDoneList(item);

            if (addDoneResult.success) {
              setIsDone(true);
              startVibration([100]);
              addToast({
                title: `${data.title} marked as done and added to completed list!`,
                color: getContentTypeColors(),
              });
            } else {
              addToast({
                title: "Error",
                description: addDoneResult.error || "Failed to add to completed list",
                color: "danger",
              });
              return;
            }
          } else {
            // Already in watchlist, move to completed list
            const result = await markAsDone(data.id, data.type, true);

            if (result.success) {
              setIsDone(true);
              startVibration([100]);
              addToast({
                title: `${data.title} marked as done and added to completed list!`,
                color: getContentTypeColors(),
              });
            } else {
              addToast({
                title: "Error",
                description: result.error || "Failed to mark as done",
                color: "danger",
              });
              return;
            }
          }
        }

        // Invalidate lists
        queryClient.invalidateQueries({ queryKey: ["watchlist"] });
        queryClient.refetchQueries({ queryKey: ["watchlist"], type: 'active' });
      } catch (error) {
        addToast({
          title: "Error",
          description: "An unexpected error occurred",
          color: "danger",
        });
      }
    });
  };

  const handleBookmark = () => {
    if (!user) {
      addToast({
        title: "You must be logged in to use this feature",
        color: "warning",
      });
      return;
    }

    startBookmarkTransition(async () => {
      try {
        if (isSaved) {
          const result = await removeFromWatchlist(data.id, data.type);

          if (result.success) {
            setIsSaved(false);

            addToast({
              title: `${data.title} removed from your watchlist!`,
              color: getContentTypeColors(),
              icon: <Trash />,
            });

            // Always invalidate watchlist cache when removing items
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
            queryClient.refetchQueries({ 
              queryKey: ["watchlist"],
              type: 'active'
            });
          } else {
            addToast({
              title: "Error",
              description: result.error || "Failed to remove from watchlist",
              color: "danger",
            });
          }
        } else {
          const watchlistItem = {
            id: data.id,
            type: data.type,
            adult: data.adult,
            backdrop_path: data.backdrop_path,
            poster_path: data.poster_path || null,
            release_date: data.release_date,
            title: data.title,
            vote_average: data.vote_average,
          };

          const result = await addToWatchlist(watchlistItem);

          if (result.success) {
            setIsSaved(true);
            startVibration([100]);
            addToast({
              title: `${data.title} added to your watchlist!`,
              color: getContentTypeColors(),
            });

            // Always invalidate watchlist cache when adding items
            queryClient.invalidateQueries({ queryKey: ["watchlist"] });
            queryClient.refetchQueries({ 
              queryKey: ["watchlist"],
              type: 'active'
            });
          } else {
            if (result.error === "This item is already in your watchlist") {
              setIsSaved(true);
              addToast({
                title: "Already in watchlist",
                description: `${data.title} is already in your watchlist`,
                color: getContentTypeColors(),
              });
            } else {
              addToast({
                title: "Error",
                description: result.error || "Failed to add to watchlist",
                color: "danger",
              });
            }
          }
        }
      } catch (error) {
        // Error updating watchlist
        addToast({
          title: "Error",
          description: "An unexpected error occurred",
          color: "danger",
        });
      }
    });
  };

  return (
    <div className="flex gap-2">
      <IconButton
        onPress={handleBookmark}
        icon={isSaved ? <BsBookmarkCheckFill size={20} /> : <BsBookmarkFill size={20} />}
        variant={isSaved ? "shadow" : "faded"}
        color="warning"
        isLoading={isUserLoading || isChecking || isBookmarkPending}
        tooltip={
          isTooltipDisabled ? undefined : isSaved ? "Remove from Watchlist" : "Add to Watchlist"
        }
      />
      <IconButton
        onPress={handleMarkAsDone}
        icon={isDone ? <Close size={20} /> : <Check size={20} />}
        variant={isDone ? "shadow" : "faded"}
        color={isDone ? "success" : "primary"}
        isLoading={isUserLoading || isChecking || isDonePending}
        tooltip={
          isTooltipDisabled ? undefined : isDone ? "Mark as Not Done" : "Mark as Done"
        }
      />
    </div>
  );
};

export default BookmarkButton;
