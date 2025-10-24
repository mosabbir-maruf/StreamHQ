"use client";

import { useCustomCarousel } from "@/hooks/useCustomCarousel";
import IconButton from "../button/IconButton";
import { EmblaOptionsType, EmblaPluginType } from "embla-carousel";
import { cn } from "@/utils/helpers";
import styles from "@/styles/embla-carousel.module.css";
import { ChevronLeft, ChevronRight } from "@/utils/icons";

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  withScrollShadow?: boolean;
  isButtonDisabled?: boolean;
  autoHideButton?: boolean;
  options?: EmblaOptionsType;
  plugins?: EmblaPluginType[];
  classNames?: {
    container?: string;
    viewport?: string;
    wrapper?: string;
  };
}

const Carousel = ({
  children,
  withScrollShadow = true,
  isButtonDisabled = false,
  autoHideButton = true,
  options = { dragFree: true, slidesToScroll: "auto" },
  plugins,
  classNames,
  ...props
}: CarouselProps) => {
  const c = useCustomCarousel(options, plugins);

  const getVisibility = () => {
    if (c.canScrollPrev && c.canScrollNext) return "both";
    if (c.canScrollPrev) return "left";
    if (c.canScrollNext) return "right";
    return "none";
  };

  return (
    <div
      {...props}
      className={cn(styles.wrapper, classNames?.wrapper, {
        "relative flex w-full flex-col justify-center": !isButtonDisabled,
      })}
    >
      {!isButtonDisabled && (
        <>
          <div
            className={cn("absolute left-0 top-1/2 z-10 -translate-y-1/2", {
              "hidden md:block": autoHideButton,
            })}
          >
            <IconButton
              onPress={c.scrollPrev}
              size="lg"
              radius="full"
              disableRipple
              icon={<ChevronLeft size={24} />}
              aria-label="Previous"
              variant="flat"
              className={cn("mx-2 size-10 bg-black/40 text-white shadow-lg ring-1 ring-black/30 hover:bg-black/60 dark:bg-white/10 dark:hover:bg-white/20 dark:ring-white/20 md:mx-4 md:size-12", {
                hidden: !c.canScrollPrev,
              })}
            />
          </div>
          <div
            className={cn("absolute right-0 top-1/2 z-10 -translate-y-1/2", {
              "hidden md:block": autoHideButton,
            })}
          >
            <IconButton
              onPress={c.scrollNext}
              size="lg"
              radius="full"
              disableRipple
              icon={<ChevronRight size={24} />}
              aria-label="Next"
              variant="flat"
              className={cn("mx-2 size-10 bg-black/40 text-white shadow-lg ring-1 ring-black/30 hover:bg-black/60 dark:bg-white/10 dark:hover:bg-white/20 dark:ring-white/20 md:mx-4 md:size-12", {
                hidden: !c.canScrollNext,
              })}
            />
          </div>
        </>
      )}
      <div className={cn(styles.viewport, classNames?.viewport)} ref={c.emblaRef}>
        <div className={cn(styles.container, classNames?.container)}>{children}</div>
      </div>
    </div>
  );
};

export default Carousel;
