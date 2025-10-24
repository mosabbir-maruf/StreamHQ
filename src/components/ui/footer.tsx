"use client";

import { Sun, Moon, ArrowUp } from "lucide-react";
import { useTheme } from "next-themes";

function handleScrollTop() {
  window.scroll({
    top: 0,
    behavior: "smooth",
  });
}

const Footer = () => {
  const { setTheme } = useTheme();

  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center gap-2 rounded-full border border-default-200 px-2 py-1">
        <button
          onClick={() => setTheme("light")}
          className="rounded-full bg-white p-2 text-black transition-all hover:scale-110 dark:bg-gray-800 dark:text-white"
        >
          <Sun className="h-5 w-5" strokeWidth={1.5} />
          <span className="sr-only">Light Mode</span>
        </button>

        <button
          type="button"
          onClick={handleScrollTop}
          className="rounded-full p-2 transition-all hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowUp className="h-4 w-4" />
          <span className="sr-only">Scroll to Top</span>
        </button>

        <button
          onClick={() => setTheme("dark")}
          className="rounded-full bg-gray-900 p-2 text-white transition-all hover:scale-110 dark:bg-white dark:text-black"
        >
          <Moon className="h-5 w-5" strokeWidth={1.5} />
          <span className="sr-only">Dark Mode</span>
        </button>
      </div>
    </div>
  );
};

export default Footer;
