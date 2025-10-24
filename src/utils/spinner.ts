/**
 * Utility function to get spinner color based on content type
 * @param content - The content type ('movie', 'tv', 'anime')
 * @returns The appropriate spinner color
 */
export const getSpinnerColor = (content: string): "primary" | "warning" | "danger" => {
  if (content === "movie") return "primary";
  if (content === "tv") return "warning";
  if (content === "anime") return "danger";
  return "primary";
};

/**
 * Get spinner color for content type with fallback
 * @param content - The content type ('movie', 'tv', 'anime')
 * @param fallback - Fallback color if content is not recognized
 * @returns The appropriate spinner color
 */
export const getSpinnerColorWithFallback = (
  content: string, 
  fallback: "primary" | "warning" | "danger" = "primary"
): "primary" | "warning" | "danger" => {
  if (content === "movie") return "primary";
  if (content === "tv") return "warning";
  if (content === "anime") return "danger";
  return fallback;
};
