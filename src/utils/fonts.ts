import { Poppins as FontPoppins, Saira as FontSaira } from "next/font/google";

export const Poppins = FontPoppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"], // Include all weights that are actually used
  variable: "--font-poppins",
  preload: false, // Disable preloading to avoid unused font warnings
  display: "swap",
  // Only preload the most critical weights to avoid unused font warnings
  fallback: ["system-ui", "arial"],
  // Optimize font loading by reducing preloaded weights
  adjustFontFallback: false,
});

export const Saira = FontSaira({
  subsets: ["latin"],
  weight: ["400", "600"], // Only load weights that are actually used
  variable: "--font-saira",
  preload: false, // Disable preloading to avoid unused font warnings
  display: "swap",
  fallback: ["system-ui", "arial"],
});
