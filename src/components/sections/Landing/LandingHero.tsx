"use client";

import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Link from "next/link";

const LandingHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(156,146,172,0.15)_1px,transparent_0)] bg-[length:20px_20px]" />
      </div>
      
      <div className="container mx-auto px-4 py-12 md:py-20 pb-8 md:pb-20 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-6 leading-tight">
              Your Ultimate
              <br />
              <span className="text-foreground">Binge-Watching Paradise</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Movies, TV shows, and anime galore - all free, all awesome! 
              Discover, watch, and enjoy unlimited entertainment.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              as={Link}
              href="/?visited=true"
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              startContent={<Play className="w-5 h-5" />}
            >
              Start Watching Now
            </Button>
            <Button
              as={Link}
              href="/aboutandfaq"
              variant="bordered"
              size="lg"
              className="border-2 border-primary/20 text-foreground hover:border-primary/40 px-8 py-6 text-lg font-semibold rounded-xl hover:bg-primary/5 transition-all duration-300"
            >
              Learn More
            </Button>
          </motion.div>


        </div>
      </div>
    </section>
  );
};

export default LandingHero;
