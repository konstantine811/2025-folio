import { forwardRef } from "react";

const Hero = forwardRef<HTMLElement, { offsetTop: number }>(
  ({ offsetTop }, ref) => {
    return (
      <section
        ref={ref}
        id="hero"
        style={{ minHeight: `calc(100vh - ${offsetTop}px)` }}
        className="h-full flex items-center justify-center relative z-0"
      >
        <div className="container mx-auto flex flex-col items-center gap-5 text-center">
          <h1 className="text-foreground text-6xl font-bold">
            3d Web Creative Developer
          </h1>
          <p className="text-muted-foreground text-xl font-semibold">
            I'm build 3D web applications. Like game, maps, charts, animations
            and other
          </p>
        </div>
      </section>
    );
  }
);

export default Hero;
