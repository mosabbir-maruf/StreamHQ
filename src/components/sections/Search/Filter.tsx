"use client";

import { getSearchSuggestions } from "@/actions/search";
import SearchInput from "@/components/ui/input/SearchInput";
import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import Highlight from "@/components/ui/other/Highlight";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { SEARCH_HISTORY_STORAGE_KEY } from "@/utils/constants";
import { cn, isEmpty } from "@/utils/helpers";
import { ArrowUpLeft, Close, History, Movie, Search, TV } from "@/utils/icons";
import { useRouter } from "@bprogress/next/app";
import { Button, Listbox, ListboxItem } from "@heroui/react";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useState } from "react";

interface SearchFilterProps extends React.HTMLAttributes<HTMLFormElement> {
  isLoading?: boolean;
  onSearchSubmit?: (value: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ isLoading, onSearchSubmit, ...props }) => {
  const router = useRouter();
  const { mobile } = useBreakpoints();
  const { content } = useDiscoverFilters();
  const [triggered, setTriggered] = useState(false);
  const [searchQuery, setSearchQuery] = useQueryState("q", parseAsString.withDefault(""));
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);
  const [searchHistories, setSearchHistories] = useLocalStorage<string[]>({
    key: SEARCH_HISTORY_STORAGE_KEY,
    defaultValue: [],
  });
  const enableFetch = debouncedSearchQuery.length > 3 && !isLoading && !triggered;
  const clearAnimControls = useAnimation();
  const [inputFocused, setInputFocused] = useState(false);
  const { data, isFetching } = useQuery({
    enabled: enableFetch,
    queryKey: ["search-suggestions", debouncedSearchQuery],
    queryFn: async () => await getSearchSuggestions(debouncedSearchQuery),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
  const showSuggestions = enableFetch && !isFetching;
  const showHistory = !showSuggestions && !isEmpty(searchHistories) && !isLoading && !triggered;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setTriggered(!isEmpty(searchQuery));
      onSearchSubmit?.(searchQuery);
      if (searchQuery && !searchHistories.includes(searchQuery)) {
        const newHistories = [...searchHistories, searchQuery];
        if (newHistories.length > 5) {
          newHistories.shift();
        }
        setSearchHistories(newHistories);
      }
    },
    [searchQuery, searchHistories],
  );

  const handleClear = useCallback(async () => {
    await clearAnimControls.start({ opacity: 0, x: -8, transition: { duration: 0.15 } });
    setSearchQuery("");
    setTriggered(false);
    onSearchSubmit?.("");
    clearAnimControls.set({ opacity: 0, x: 8 });
    await clearAnimControls.start({ opacity: 1, x: 0, transition: { duration: 0.15 } });
  }, []);

  useEffect(() => {
    if (!triggered && !isEmpty(searchQuery)) {
      setTriggered(true);
      onSearchSubmit?.(searchQuery);
    }
  }, [searchQuery, triggered]);

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex w-full max-w-xl flex-col justify-center gap-5 text-center", {
        "mx-auto px-3 md:px-0 mt-16 md:mt-24": !triggered,
      })}
      {...props}
    >
      <ContentTypeSelection className="justify-center" />
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center justify-center gap-2">
          <motion.div
            animate={clearAnimControls}
            initial={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div animate={{ scale: inputFocused ? 1.02 : 1 }} transition={{ duration: 0.12 }}>
              <SearchInput
                autoFocus={!mobile}
                placeholder={`Search your favorite ${content === "movie" ? "movies" : content === "tv" ? "TV shows" : "anime"}...`}
                isLoading={isLoading}
                value={searchQuery}
                onValueChange={(val) => {
                  setSearchQuery(val);
                  if (isEmpty(val)) setTriggered(false);
                }}
                onClear={!isEmpty(searchQuery) ? handleClear : undefined}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
            </motion.div>
          </motion.div>
          <AnimatePresence>
            {!isEmpty(searchQuery) && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  isLoading={isLoading}
                  isIconOnly={mobile}
                  type="submit"
                  radius="full"
                  variant="flat"
                  color={content === "movie" ? "primary" : content === "tv" ? "warning" : "danger"}
                >
                  {mobile ? <Search /> : "Search"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {(showSuggestions || showHistory) && !(showSuggestions && isEmpty(data?.data)) && (
          <AnimatePresence>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Listbox
                variant="flat"
                emptyContent={<p className="text-center">No search suggestions</p>}
                aria-label="Search Suggestions"
                className="bg-content1 rounded-medium absolute top-12 z-999 w-full shadow-2xl md:top-13"
                classNames={{
                  list: "max-h-[10rem] md:max-h-[15rem] overflow-y-auto",
                }}
              >
                <>
                  {showHistory &&
                    searchHistories.map((history, index) => (
                      <ListboxItem
                        key={`history-${index}`}
                        className="text-start"
                        startContent={<History />}
                        endContent={
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="size-6"
                            onPress={() =>
                              setSearchHistories(
                                searchHistories.filter(
                                  (currentHistory) => currentHistory !== history,
                                ),
                              )
                            }
                          >
                            <Close size={24} />
                          </Button>
                        }
                        onPress={() => setSearchQuery(history)}
                      >
                        {history}
                      </ListboxItem>
                    ))}
                  {showSuggestions &&
                    (data?.data || []).map(({ id, title, type }, index) => (
                      <ListboxItem
                        key={`suggestion-${index}`}
                        className="text-start"
                        startContent={
                          type === "movie" ? (
                            <Movie className="text-primary" />
                          ) : (
                            <TV className="text-warning" />
                          )
                        }
                        endContent={
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            className="size-6"
                            onPress={() => {
                              setSearchQuery(title);
                            }}
                          >
                            <ArrowUpLeft size={20} />
                          </Button>
                        }
                        onPress={() => router.push(`/${type}/${id}`)}
                      >
                        <Highlight markType="bold" highlight={debouncedSearchQuery}>
                          {title}
                        </Highlight>
                      </ListboxItem>
                    ))}
                </>
              </Listbox>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </form>
  );
};

export default SearchFilter;
