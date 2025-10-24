import { siteConfig } from "@/config/site";
import dynamic from "next/dynamic";
import { Metadata, NextPage } from "next/types";
import { Suspense } from "react";

// Cache the page for 5 minutes (300 seconds)
export const revalidate = 300;

const SearchList = dynamic(() => import("@/components/sections/Search/List"));

export const metadata: Metadata = {
  title: `Search Movies | ${siteConfig.name}`,
};

const SearchPage: NextPage = () => {
  return (
    <div className="flex flex-col gap-10">
      <Suspense>
        <SearchList />
      </Suspense>
    </div>
  );
};

export default SearchPage;
