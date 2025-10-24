"use client";

import { Image } from "@heroui/react";
import { AnimeMedia } from "@/api/anilist";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Gallery from "@/components/ui/overlay/Gallery";
import { Slide } from "yet-another-react-lightbox";
import { useState } from "react";
import { Eye } from "@/utils/icons";

interface PhotosSectionProps {
  anime: AnimeMedia;
}

const PhotosSection: React.FC<PhotosSectionProps> = ({ anime }) => {
  const [index, setIndex] = useState<number>(-1);
  
  // Collect available images from anime data
  const images: Array<{ src: string; alt: string; width?: number; height?: number }> = [];
  
  // Add cover image
  if (anime.coverImage?.large) {
    images.push({
      src: anime.coverImage.large,
      alt: `${anime.title.romaji} Cover`,
      width: 400,
      height: 600
    });
  }
  
  // Add banner image
  if (anime.bannerImage) {
    images.push({
      src: anime.bannerImage,
      alt: `${anime.title.romaji} Banner`,
      width: 1000,
      height: 300
    });
  }
  
  // Add character images (main characters only)
  const mainCharacters = anime.characters?.edges
    ?.filter((c) => c.role === "MAIN")
    ?.slice(0, 6) || [];
    
  mainCharacters.forEach((character) => {
    if (character.node.image?.large) {
      images.push({
        src: character.node.image.large,
        alt: `${character.node.name.full} Character`,
        width: 200,
        height: 200
      });
    }
  });

  if (images.length === 0) return null;

  const slides: Slide[] = images.map(({ src, alt, width, height }) => ({
    src,
    description: alt,
    width,
    height
  }));

  return (
    <section id="gallery" className="z-3 flex flex-col gap-2">
      <SectionTitle color="danger">Photos</SectionTitle>
      <div className="grid grid-cols-2 place-items-stretch gap-3 sm:grid-cols-4">
        {images.slice(0, 4).map(({ src, alt }, imageIndex) => (
          <div key={src} className="group relative">
            <Image
              onClick={() => setIndex(imageIndex)}
              isBlurred
              isZoomed
              width={600}
              alt={alt}
              src={src}
              className="w-full aspect-video cursor-pointer object-cover"
            />

            {imageIndex === 3 && images.length > 4 ? (
              <div
                className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-medium bg-black/40 text-xl font-bold text-white backdrop-blur-xs"
                onClick={() => setIndex(imageIndex)}
              >
                +{images.length - 4}
              </div>
            ) : (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/35 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <Gallery open={index >= 0} index={index} close={() => setIndex(-1)} slides={slides} />
    </section>
  );
};

export default PhotosSection;
