import { forwardRef } from "react";
import LogoAnimated from "../logo";
import { useThemeStore } from "@/storage/themeStore";
import { ThemePalette } from "@/config/theme-colors.config";

type Props = {
  srcImage?: string;
  title: string;
  description?: string;
  onClick?: () => void;
};

const Card = forwardRef<HTMLDivElement, Props>(
  ({ srcImage, title, onClick }, ref) => {
    const theme = useThemeStore((state) => state.selectedTheme);
    return (
      <div
        ref={ref}
        onClick={onClick}
        className="group relative rounded-md cursor-pointer bg-foreground/10 card p-[1px] hover:scale-99 duration-300 flex flex-col"
      >
        <div className="flex z-[2] bg-card  aspect-square  relative rounded-t-md">
          {srcImage ? (
            <img
              className="object-cover w-full p-5"
              src={srcImage}
              alt={title}
            />
          ) : (
            <div className="w-15 flex items-center justify-center h-full">
              <LogoAnimated />
            </div>
          )}
        </div>
        <div className="relative z-20 flex items-center mt-[1px] justify-between  w-full px-4 py-2 bg-card rounded-b-md grow">
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
