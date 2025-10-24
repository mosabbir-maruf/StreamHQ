"use client";

import { Card, CardBody, CardFooter, Image } from "@heroui/react";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Carousel from "@/components/ui/wrapper/Carousel";
import { AnimeMedia } from "@/api/anilist";

interface Character {
  id: number;
  role: string;
  node: {
    id: number;
    name: {
      full: string;
    };
    image: {
      large: string;
      medium: string;
    };
  };
  voiceActors: Array<{
    id: number;
    name: {
      full: string;
    };
    image: {
      large: string;
      medium: string;
    };
    language: string;
  }>;
}

interface CharactersSectionProps {
  characters: Character[];
}

const CharactersSection: React.FC<CharactersSectionProps> = ({ characters }) => {
  if (!characters || characters.length === 0) return null;

  // Filter to only main and supporting characters
  const mainCharacters = characters.filter(
    (c) => c.role === "MAIN" || c.role === "SUPPORTING"
  ).slice(0, 15);

  return (
    <section id="characters" className="flex flex-col gap-4">
      <SectionTitle>Characters & Voice Actors</SectionTitle>
      <Carousel>
        {mainCharacters.map((character) => {
          const voiceActor = character.voiceActors?.[0]; // Get first (Japanese) voice actor

          return (
            <div key={character.id} className="embla__slide">
              <Card className="h-full w-[280px] bg-secondary-background">
                <CardBody className="p-0">
                  <div className="flex">
                    {/* Character */}
                    <div className="flex flex-1 flex-col items-center gap-2 p-3">
                      <Image
                        isBlurred
                        alt={character.node.name.full}
                        className="h-24 w-24 object-cover"
                        src={character.node.image.large}
                        radius="full"
                      />
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-center text-sm font-semibold line-clamp-2">
                          {character.node.name.full}
                        </p>
                        <p className="text-xs text-default-500">{character.role}</p>
                      </div>
                    </div>

                    {/* Voice Actor */}
                    {voiceActor && (
                      <div className="flex flex-1 flex-col items-center gap-2 border-l border-divider p-3">
                        <Image
                          isBlurred
                          alt={voiceActor.name.full}
                          className="h-24 w-24 object-cover"
                          src={voiceActor.image.large}
                          radius="full"
                        />
                        <div className="flex flex-col items-center gap-1">
                          <p className="text-center text-sm font-semibold line-clamp-2">
                            {voiceActor.name.full}
                          </p>
                          <p className="text-xs text-default-500">Voice Actor</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          );
        })}
      </Carousel>
    </section>
  );
};

export default CharactersSection;

