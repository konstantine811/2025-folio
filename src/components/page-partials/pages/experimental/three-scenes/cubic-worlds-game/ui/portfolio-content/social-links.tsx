import { Facebook, Github, Instagram, Linkedin, Youtube } from "lucide-react";

const SocialLinks = () => {
  return (
    <div className="px-5 md:px-10 lg:px-20 flex justify-center gap-4">
      <a
        href="https://www.instagram.com/konstantine911/"
        className="hover:underline text-red-500"
        target="_blank"
      >
        <Instagram className="h-10 w-10" />
      </a>
      <a
        href="https://www.linkedin.com/in/kostiantyn-abramkin-959584142/"
        target="_blank"
        className="text-blue-500 hover:underline"
      >
        <Linkedin className="h-10 w-10" />
      </a>
      <a
        href="https://www.facebook.com/constaine.abrams"
        target="_blank"
        className="text-blue-500 hover:underline"
      >
        <Facebook className="h-10 w-10" />
      </a>
      <a
        href="https://github.com/konstantine811?tab=repositories"
        target="_blank"
        className="text-background hover:underline"
      >
        <Github className="h-10 w-10" />
      </a>
      <a
        href="https://www.youtube.com/@abramkin-konstantin"
        target="_blank"
        className="text-red-600 hover:underline"
      >
        <Youtube className="h-10 w-10" />
      </a>
    </div>
  );
};

export default SocialLinks;
