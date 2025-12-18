import { forwardRef, useState, useEffect, useRef } from "react";
import { Loader2Icon } from "lucide-react";
import LogoAnimated from "../logo/logo";
import { useThemeStore } from "@/storage/themeStore";
import { ThemePalette } from "@/config/theme-colors.config";
import { cn } from "@/lib/utils";

type Props = {
  srcImage?: string;
  title: string;
  description?: string;
  onClick?: () => void;
};

const Card = forwardRef<HTMLDivElement, Props>(
  ({ srcImage, title, onClick }, ref) => {
    const [isImageError, setIsImageError] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(true);
    const imgRef = useRef<HTMLImageElement>(null);

    const theme = useThemeStore((state) => state.selectedTheme);

    // Callback ref для перевірки стану зображення одразу після монтування
    const setImgRef = (img: HTMLImageElement | null) => {
      imgRef.current = img;
      if (img && srcImage && img.complete && img.naturalHeight !== 0) {
        setIsImageLoading(false);
      }
    };

    useEffect(() => {
      if (srcImage) {
        setIsImageLoading(true);
        setIsImageError(false);

        // Перевірка чи зображення вже завантажене (з кешу)
        const checkImageLoaded = () => {
          const img = imgRef.current;
          if (img?.complete && img.naturalHeight !== 0) {
            setIsImageLoading(false);
          }
        };

        // Використовуємо requestAnimationFrame для перевірки після рендеру
        const rafId = requestAnimationFrame(() => {
          checkImageLoaded();
        });

        // Додаткова перевірка через невеликий таймаут на випадок якщо зображення завантажується дуже швидко
        const timeoutId = setTimeout(checkImageLoaded, 50);

        return () => {
          cancelAnimationFrame(rafId);
          clearTimeout(timeoutId);
        };
      } else {
        setIsImageLoading(false);
      }
    }, [srcImage]);
    return (
      <div
        ref={ref}
        onClick={onClick}
        className="group relative rounded-xl cursor-pointer bg-foreground/10 card p-[1px] hover:scale-99 duration-300 flex flex-col"
      >
        <div className="flex bg-card aspect-square relative rounded-t-md">
          <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent opacity-90"></div>
          {srcImage && !isImageError ? (
            <>
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Loader2Icon
                    role="status"
                    aria-label="Loading"
                    className={cn("size-6 animate-spin")}
                  />
                </div>
              )}
              <img
                ref={setImgRef}
                className="object-cover w-full p-5"
                src={srcImage}
                alt={title}
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  setIsImageError(true);
                  setIsImageLoading(false);
                }}
              />
            </>
          ) : (
            <div className="w-full flex items-center justify-center h-full">
              <div className="w-15">
                <LogoAnimated />
              </div>
            </div>
          )}
        </div>
        <div className="relative flex items-center mt-[1px] justify-between  w-full px-4 py-2 bg-card rounded-b-md grow">
          <span className="w-1 h-1 rounded-full bg-foreground/20"></span>
          <span className="">{title}</span>
          <span className="w-1 h-1 rounded-full bg-foreground/20"></span>
        </div>

        <div
          className="absolute top-0 left-0 w-full h-full transition-opacity duration-500 rounded-md opacity-0 group-hover:opacity-100 z-1"
          style={{
            background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y),${ThemePalette[theme]["muted-foreground"]},transparent 40%)`,
          }}
        ></div>
      </div>
    );
  }
);

export default Card;
