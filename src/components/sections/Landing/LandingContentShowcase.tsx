"use client";

import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { Play, ArrowRight, Film, Tv, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { tmdb } from "@/api/tmdb";
import { anilist } from "@/api/anilist";
import { cachedFetch } from "@/utils/apiCache";

const LandingContentShowcase = () => {
  const [trendingData, setTrendingData] = useState({
    movies: null as any,
    tv: null as any,
    anime: null as any,
    loading: true
  });

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        const [moviesData, tvData, animeData] = await Promise.allSettled([
          cachedFetch("landing-trending-movies", () => tmdb.trending.trending("movie", "week"), 15 * 60 * 1000), // 15 minutes cache
          cachedFetch("landing-trending-tv", () => tmdb.trending.trending("tv", "week"), 15 * 60 * 1000), // 15 minutes cache
          cachedFetch("landing-trending-anime", () => anilist.getTrending(1, 20), 15 * 60 * 1000) // 15 minutes cache
        ]);


        setTrendingData({
          movies: moviesData.status === 'fulfilled' ? moviesData.value : null,
          tv: tvData.status === 'fulfilled' ? tvData.value : null,
          anime: animeData.status === 'fulfilled' ? animeData.value : null,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching trending data:", error);
        setTrendingData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchTrendingData();
  }, []);

  const contentTypes = [
    {
      title: "Movies",
      description: "Blockbusters, indie films, and everything in between",
      icon: <Film className="w-8 h-8" />,
      color: "from-primary-500 to-primary-600",
      bgColor: "bg-primary-500/10",
      borderColor: "border-primary-500/20",
      iconBg: "bg-primary-500",
      href: "/discover?content=movie",
      stats: "6,500+ Movies",
      features: ["Latest Releases", "Classic Films", "International Cinema", "Documentaries"]
    },
    {
      title: "TV Shows",
      description: "Binge-worthy series from all genres and countries",
      icon: <Tv className="w-8 h-8" />,
      color: "from-warning-500 to-warning-600",
      bgColor: "bg-warning-500/10",
      borderColor: "border-warning-500/20",
      iconBg: "bg-warning-500",
      href: "/discover?content=tv",
      stats: "2,800+ Series",
      features: ["Popular Shows", "Ongoing Series", "Completed Series", "Reality TV"]
    },
    {
      title: "Anime",
      description: "The best anime from Japan and around the world",
      icon: <Zap className="w-8 h-8" />,
      color: "from-danger-500 to-danger-600",
      bgColor: "bg-danger-500/10",
      borderColor: "border-danger-500/20",
      iconBg: "bg-danger-500",
      href: "/discover?content=anime",
      stats: "700+ Anime",
      features: ["Seasonal Anime", "Classic Series", "Movies", "OVA & Specials"]
    }
  ];

  const getPopularContent = () => {
    // Always return fallback images if loading or if there's an error
    if (trendingData.loading || !trendingData.movies || !trendingData.tv || !trendingData.anime) {
      return [
        {
          title: "Trending Movies",
          description: "What everyone is watching",
          image: "/images/fallback.jpg",
          type: "movies",
          href: "/discover?content=movie"
        },
        {
          title: "Trending TV Shows",
          description: "Popular series everyone's talking about",
          image: "/images/fallback.jpg",
          type: "tv",
          href: "/discover?content=tv"
        },
        {
          title: "Trending Anime",
          description: "Latest and greatest anime",
          image: "/images/NA Backdrop.png",
          type: "anime",
          href: "/discover?content=anime"
        }
      ];
    }

    // Try to get real images, but fallback to static images if any fail
    const getMovieImage = () => {
      try {
        const backdropPath = trendingData.movies?.results?.[0]?.backdrop_path;
        return backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : "/images/fallback.jpg";
      } catch {
        return "/images/fallback.jpg";
      }
    };

    const getTvImage = () => {
      try {
        const backdropPath = trendingData.tv?.results?.[0]?.backdrop_path;
        return backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : "/images/fallback.jpg";
      } catch {
        return "/images/fallback.jpg";
      }
    };

    const getAnimeImage = () => {
      try {
        // Use the correct data structure from AniList API
        const media = trendingData.anime?.Page?.media;
        
        if (media && media.length > 0) {
          const firstAnime = media[0];
          const bannerImage = firstAnime?.bannerImage;
          const coverImage = firstAnime?.coverImage?.extraLarge || firstAnime?.coverImage?.large;
          
          return bannerImage || coverImage || "/images/NA Backdrop.png";
        }
        
        return "/images/NA Backdrop.png";
      } catch (error) {
        console.error("Error getting anime image:", error);
        return "/images/NA Backdrop.png";
      }
    };

    return [
      {
        title: "Trending Movies",
        description: "What everyone is watching",
        image: getMovieImage(),
        type: "movies",
        href: "/discover?content=movie"
      },
      {
        title: "Trending TV Shows",
        description: "Popular series everyone's talking about",
        image: getTvImage(),
        type: "tv",
        href: "/discover?content=tv"
      },
      {
        title: "Trending Anime",
        description: "Latest and greatest anime",
        image: getAnimeImage(),
        type: "anime",
        href: "/discover?content=anime"
      }
    ];
  };

  const popularContent = getPopularContent();

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Endless Entertainment
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              From Hollywood blockbusters to hidden anime gems, discover content that matches your taste
            </p>
          </motion.div>

          {/* Content Types */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
          >
            {contentTypes.map((content, index) => (
              <motion.div
                key={content.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`group relative p-8 rounded-3xl ${content.bgColor} border-2 ${content.borderColor} hover:border-opacity-40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-2xl ${content.iconBg} text-white`}>
                    {content.icon}
                  </div>
                  <span className="text-sm font-medium text-foreground/60">
                    {content.stats}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {content.title}
                </h3>
                <p className="text-foreground/70 mb-6 leading-relaxed">
                  {content.description}
                </p>

                <div className="space-y-2 mb-8">
                  {content.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 ${content.iconBg} rounded-full`} />
                      <span className="text-sm text-foreground/70">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  as={Link}
                  href={content.href}
                  className={`w-full bg-gradient-to-r ${content.color} text-white hover:opacity-90 transition-all duration-300`}
                  endContent={<ArrowRight className="w-4 h-4" />}
                >
                  Explore {content.title}
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {/* Popular Content Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-12"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                What's Trending Right Now
              </h3>
              <p className="text-lg text-foreground/70">
                Discover the hottest movies, TV shows, and anime everyone's watching
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {popularContent.map((content, index) => (
                <motion.div
                  key={content.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-2xl bg-background/60 border border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                >
                  <Link href={content.href}>
                    <div className="aspect-video relative overflow-hidden">
                      <Image
                        src={content.image}
                        alt={content.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-white font-semibold text-lg mb-1">
                          {content.title}
                        </h4>
                        <p className="text-white/80 text-sm">
                          {content.description}
                        </p>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="w-10 h-10 bg-primary/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Play className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                as={Link}
                href="/discover"
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold rounded-xl"
                endContent={<ArrowRight className="w-5 h-5" />}
              >
                Discover More Content
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingContentShowcase;
