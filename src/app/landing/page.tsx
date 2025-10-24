"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Spinner } from "@heroui/react";

// Dynamically import landing page components for better performance
const LandingHero = dynamic(() => import("@/components/sections/Landing/LandingHero"));
const LandingFeatures = dynamic(() => import("@/components/sections/Landing/LandingFeatures"));
const LandingContentShowcase = dynamic(() => import("@/components/sections/Landing/LandingContentShowcase"));
const LandingCTA = dynamic(() => import("@/components/sections/Landing/LandingCTA"));

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" className="absolute-center" variant="simple" color="primary" />
        </div>
      }>
        <LandingHero />
      </Suspense>

      {/* Features Section */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" className="absolute-center" variant="simple" color="primary" />
        </div>
      }>
        <LandingFeatures />
      </Suspense>

      {/* Content Showcase Section */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" className="absolute-center" variant="simple" color="primary" />
        </div>
      }>
        <LandingContentShowcase />
      </Suspense>

      {/* Call to Action Section */}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" className="absolute-center" variant="simple" color="primary" />
        </div>
      }>
        <LandingCTA />
      </Suspense>
    </div>
  );
};

export default LandingPage;
