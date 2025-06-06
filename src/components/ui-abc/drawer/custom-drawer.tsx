import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import SoundHoverElement from "../sound-hover-element";
import { ArrowBigLeft } from "lucide-react";
import { useEffect, useState } from "react";

const CustomDrawer = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [t] = useTranslation();
  console.log("CustomDrawer rendered");
  useEffect(() => {
    console.log("CustomDrawer mounted");
  }, []);
  return (
    <>
      <div className="fixed right-0 top-0 z-50 bg-white">
        <Button
          onClick={() => {
            setOpen((prev) => !prev);
          }}
          className="bg-card hover:bg-card/10 rounded-r-none fixed right-0 z-30 text-foreground"
        >
          <SoundHoverElement animValue={-3.3} hoverAnimType="translate-x">
            <ArrowBigLeft />
          </SoundHoverElement>
        </Button>
      </div>
      {open && (
        <div className="absolute top-0 left-0 flex h-screen w-screen flex-col items-center justify-center z-40 bg-black/50 ">
          <div className="border-foreground/10 overflow-y-auto overflow-x-hidden touch-auto overscroll-contain absolute">
            <div className="h-screen w-full touch-auto overscroll-contain">
              <div className="mx-auto w-full max-w-sm px-4 box-border">
                <div className="text-foreground">
                  <h1>{t(title)}</h1>
                  <p>{t(description)}</p>
                </div>
                {children}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomDrawer;
