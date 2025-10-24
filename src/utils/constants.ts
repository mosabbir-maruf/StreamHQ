// Environment variables
const IS_BROWSER = typeof window !== "undefined";
const IS_SERVER = !IS_BROWSER;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
const IS_TEST = process.env.NODE_ENV === "test";

// Storage keys
const DISCLAIMER_STORAGE_KEY = "disclaimer-agreed";
const ADS_WARNING_STORAGE_KEY = "ads-warning-seen";
const LIBRARY_STORAGE_KEY = "bookmarks";
const SEARCH_HISTORY_STORAGE_KEY = "search-histories";

// Others
const ITEMS_PER_PAGE = 20;
const SpacingClasses = {
  main: "px-3 py-8 pb-28 sm:px-5", // extra bottom padding so footer/bottom navbar don't cover content
  reset: "-mx-3 -my-8 sm:-mx-5",
};

// Exports
export {
  IS_BROWSER,
  IS_SERVER,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  IS_TEST,
  DISCLAIMER_STORAGE_KEY,
  ADS_WARNING_STORAGE_KEY,
  LIBRARY_STORAGE_KEY,
  SEARCH_HISTORY_STORAGE_KEY,
  ITEMS_PER_PAGE,
  SpacingClasses,
};
