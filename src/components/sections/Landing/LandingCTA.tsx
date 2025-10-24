"use client";

import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { Play, ArrowRight, Shield, Zap, Clock } from "lucide-react";
import Link from "next/link";

const LandingCTA = () => {

  const benefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Access",
      description: "Start watching immediately, no registration required"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Free",
      description: "No hidden fees, no subscriptions, completely free"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Always Updated",
      description: "Fresh content added daily with latest releases"
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Main CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl p-12 border border-primary/20">
              <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Ready to Start Your
                <br />
                <span className="text-primary">Entertainment Journey?</span>
              </h2>
              <p className="text-xl text-foreground/70 mb-8 max-w-3xl mx-auto">
                Join thousands of users who have already discovered their new favorite streaming platform. 
                Start watching amazing content right now - completely free!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button
                  as={Link}
                  href="/?visited=true"
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  startContent={<Play className="w-6 h-6" />}
                >
                  Start Watching Now
                </Button>
                <Button
                  as={Link}
                  href="/library"
                  variant="bordered"
                  size="lg"
                  className="border-2 border-primary/30 text-foreground hover:border-primary/50 px-10 py-6 text-xl font-semibold rounded-xl hover:bg-primary/5 transition-all duration-300"
                  endContent={<ArrowRight className="w-6 h-6" />}
                >
                  Create Library
                </Button>
              </div>


              {/* Quick Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3 p-4 rounded-xl bg-background/60 hover:bg-background/80 transition-colors duration-300"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {benefit.icon}
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-foreground text-sm">
                        {benefit.title}
                      </h4>
                      <p className="text-xs text-foreground/70">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>


        </div>
      </div>
    </section>
  );
};

export default LandingCTA;
