"use client";

import { motion } from "framer-motion";
import { 
  Film, 
  Tv, 
  Zap, 
  Smartphone, 
  Globe, 
  Heart,
  Search,
  Bookmark,
  Download,
  Shield,
  Clock,
  Star
} from "lucide-react";

const LandingFeatures = () => {
  const features = [
    {
      icon: <Film className="w-8 h-8" />,
      title: "Latest Movies",
      description: "Watch the newest blockbusters and indie films from around the world",
      color: "text-red-500"
    },
    {
      icon: <Tv className="w-8 h-8" />,
      title: "TV Series",
      description: "Binge-watch your favorite shows and discover new series",
      color: "text-blue-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Anime Collection",
      description: "Extensive library of anime from classics to the latest releases",
      color: "text-purple-500"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile Optimized",
      description: "Perfect viewing experience on any device, anywhere",
      color: "text-green-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi-Language",
      description: "Content in multiple languages with subtitles support",
      color: "text-orange-500"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Personal Library",
      description: "Save your favorites and create custom watchlists",
      color: "text-pink-500"
    }
  ];

  const benefits = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Smart Search",
      description: "Find exactly what you want with our intelligent search"
    },
    {
      icon: <Bookmark className="w-6 h-6" />,
      title: "Watchlists",
      description: "Save movies and shows for later viewing"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Offline Ready",
      description: "Download content for offline viewing"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Safe & Secure",
      description: "Your privacy and security are our top priority"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Continue Watching",
      description: "Pick up where you left off across all devices"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Recommendations",
      description: "Get personalized suggestions based on your taste"
    }
  ];

  return (
    <section className="pt-8 md:pt-20 pb-12 md:pb-20 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose <span className="text-primary">StreamHQ</span>?
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
              Experience entertainment like never before with our comprehensive platform
            </p>
          </motion.div>

          {/* Main Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
              >
                <div className={`${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl p-12"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything You Need
              </h3>
              <p className="text-lg text-foreground/70">
                Powerful features to enhance your viewing experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-4 p-4 rounded-xl bg-background/60 hover:bg-background/80 transition-colors duration-300"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-foreground/70">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
