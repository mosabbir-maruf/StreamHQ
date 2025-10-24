import { Image } from "@heroui/image";
import { useWindowScroll } from "@mantine/hooks";
import { getAnimeBannerUrl, mutateAnimeTitle } from "@/utils/anime";
import { AnimeMedia } from "@/api/anilist";
import useBreakpoints from "@/hooks/useBreakpoints";

const BackdropSection: React.FC<{
  anime: AnimeMedia | undefined;
}> = ({ anime }) => {
  const [{ y }] = useWindowScroll();
  const { mobile } = useBreakpoints();
  // Reduce scroll sensitivity on mobile to prevent excessive calculations
  const scrollMultiplier = mobile ? 0.5 : 1;
  const opacity = Math.min((y / 1000) * 2 * scrollMultiplier, 1);
  const bannerImage = getAnimeBannerUrl(anime?.bannerImage);
  const title = mutateAnimeTitle(anime || {});

  return (
    <section id="backdrop" className="fixed inset-0 h-[35vh] md:h-[50vh] lg:h-[70vh]">
      <div className="absolute inset-0 z-10 bg-background" style={{ opacity: opacity }} />
      <div className="absolute inset-0 z-2 bg-linear-to-b from-background from-1% via-transparent via-30%" />
      <div className="absolute inset-0 z-2 translate-y-px bg-linear-to-t from-background from-1% via-transparent via-55%" />
      <Image
        radius="none"
        alt={title}
        className="z-0 h-[35vh] w-screen object-cover object-center md:h-[50vh] lg:h-[70vh]"
        src={bannerImage}
      />
    </section>
  );
};

export default BackdropSection;

