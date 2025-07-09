import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import Hero from "./hero";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/classname";

const Init = () => {
  const hS = useHeaderSizeStore((state) => state.size);
  const [innerHeaderSize, setInnerHeaderSize] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const [currentService, setCurrentService] = useState<number>(0);

  useEffect(() => {
    if (headerRef.current) {
      setInnerHeaderSize(headerRef.current.offsetHeight);
    }
  }, []);
  return (
    <main>
      <header
        ref={headerRef}
        className="py-3 sticky bg-foreground/10 backdrop-blur-xs"
        style={{ top: hS }}
      >
        <div className="container mx-auto flex gap-5 justify-center font-bold">
          <a href="#hero">Home</a>
          <a href="#services">Services</a>
          <a href="#team">Team</a>
          <a href="#portfolio">Portfolio</a>
          <a href="#contact">Contact</a>
        </div>
      </header>
      <Hero offsetTop={innerHeaderSize + hS} />
      <section id="services" className="container mx-auto py-20 flex flex-col ">
        <h2 className="text-4xl font-bold mb-10 text-center">My Services</h2>
        <div className="flex mt-2 gap-5">
          <div
            className="grow flex-1/2 bg-foreground h-full"
            style={{ minHeight: `calc(100vh - ${hS + 200}px)` }}
          ></div>
          <div className="flex flex-1/2 flex-col gap-2">
            <div
              className={cn(
                `${
                  currentService === 0 && "bg-accent/20"
                } p-5 cursor-pointer hover:bg-foreground/10 transition-background`
              )}
              onClick={() => setCurrentService(0)}
            >
              <h3 className="text-2xl font-semibold mb-3">
                3D Web Development
              </h3>
              <p className="text-muted-foreground">
                Creating interactive 3D web applications using Three.js and
                React. This includes building immersive experiences like games,
                data visualizations, and animations that run smoothly in the
                browser.
              </p>
            </div>

            <div
              className={cn(
                `${
                  currentService === 1 && "bg-accent/20"
                } p-5 cursor-pointer hover:bg-foreground/10 transition-background`
              )}
              onClick={() => setCurrentService(1)}
            >
              <h3 className="text-2xl font-semibold mb-3">
                Map (Mapbox, Arcgis) Development
              </h3>
              <p className="text-muted-foreground">
                Developing custom maps using Mapbox and ArcGIS. This involves
                integrating geographic data, creating interactive map layers,
                and building applications that visualize spatial information in
                a user-friendly way.
              </p>
            </div>

            <div
              className={cn(
                `${
                  currentService === 2 && "bg-accent/20"
                } p-5 cursor-pointer hover:bg-foreground/10 transition-background`
              )}
              onClick={() => setCurrentService(2)}
            >
              <h3 className="text-2xl font-semibold mb-3">Training</h3>
              <p className="text-muted-foreground">
                Offering training sessions and workshops on Three.js, React, and
                web development best practices. This includes hands-on coding
                sessions, tutorials, and guidance on building 3D web
                applications from scratch.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="team" className="container mx-auto py-20">
        <div className="mb-10 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-5">My Team</h2>
          <p className="text-muted-foreground text-xl">
            Meet our talented team of developers and designers who are
            passionate about creating innovative and user-friendly web
            applications.
          </p>
        </div>
        <div className="flex gap-5 items-center">
          <div className="w-1/2 max-w-md mx-auto">
            <p className="text-xl font-bold">John Doe</p>
            <p className="text-muted-foreground">CEO</p>
            <p className="text-foreground">
              John is CEO of the company and has over 10 years of experience in
              web development. He specializes in building scalable and efficient
              web applications using modern technologies like React, Next.js,
              and Tailwind CSS. His passion for coding and problem-solving
              drives the team to deliver high-quality products.
            </p>
          </div>
          <div className="h-[50vh] bg-gradient-to-b from-accent to-destructive w-1/2"></div>
        </div>

        <div className="flex gap-5 items-center">
          <div className="h-[50vh] bg-gradient-to-b from-destructive to-foreground w-1/2"></div>
          <div className="w-1/2 max-w-md mx-auto">
            <p className="text-xl font-bold">Jane Smith</p>
            <p className="text-muted-foreground">Lead Developer</p>
            <p className="text-foreground">
              John is a seasoned web developer with a strong background in
              front-end development. He has experience working on projects using
              React, Next.js, and Tailwind CSS. He is dedicated to delivering
              high-quality, responsive, and user-friendly web applications.
            </p>
          </div>
        </div>
        <div className="flex gap-5 items-center">
          <div className="w-1/2 max-w-md mx-auto">
            <p className="text-xl font-bold">Linda Doe</p>
            <p className="text-muted-foreground">Designer</p>
            <p className="text-foreground">
              Linda is a talented designer with a keen eye for detail. She
              creates visually appealing and user-friendly interfaces that
              enhance the user experience. Her expertise in design tools and
              principles ensures that our web applications are not only
              functional but also aesthetically pleasing.
            </p>
          </div>
          <div className="h-[50vh] bg-gradient-to-b from-foreground to-accent w-1/2"></div>
        </div>
      </section>

      <section
        id="portfolio"
        className="container mx-auto py-20 flex flex-col"
        style={{ minHeight: `calc(100vh - ${hS}px)` }}
      >
        <div className="mb-10 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-5">My Portfolio</h2>
          <p className="text-muted-foreground text-xl ">
            I have worked on various projects, including web applications,
            interactive maps, and 3D visualizations. My portfolio showcases my
            skills in React, Three.js, and other modern web technologies.
          </p>
        </div>
        <div className="grow h-full bg-gradient-to-b from-foreground to-card"></div>
      </section>

      <section id="contact" className="container mx-auto py-20">
        <div className="mb-10 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-5">Contact Me</h2>
          <p className="text-muted-foreground text-xl">
            If you have any questions or want to discuss a project, feel free to
            reach out. I'm always open to new opportunities and collaborations.
          </p>
        </div>
        <form className="max-w-md mx-auto flex flex-col gap-5">
          <input
            type="text"
            placeholder="Your Name"
            className="p-3 border border-muted rounded"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="p-3 border border-muted rounded"
          />
          <textarea
            placeholder="Your Message"
            className="p-3 border border-muted rounded h-32"
          ></textarea>
          <button className="bg-accent text-white p-3 rounded hover:bg-accent/80 transition-colors">
            Send Message
          </button>
        </form>
      </section>
    </main>
  );
};

export default Init;
