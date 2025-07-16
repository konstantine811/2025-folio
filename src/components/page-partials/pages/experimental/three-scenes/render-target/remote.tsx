import { Button } from "@/components/ui/button";
import useRemote from "./context/useRemote";

const Remote = () => {
  const { setMode } = useRemote();
  return (
    <div className="fixed z-10 bottom-1 right-1 w-44  bg-linear-to-b from-background to-muted-foreground rounded shadow shadow-foreground">
      <div className="flex flex-col items-center p-1 gap-0.5">SONY</div>
      <div className="flex flex-col items-center p-3 gap-0.5">
        <Button
          className="w-full"
          size={"lg"}
          variant={"outline"}
          onClick={() => setMode("tv")}
        >
          TV
        </Button>
        <Button
          className="w-full"
          size={"lg"}
          variant={"outline"}
          onClick={() => setMode("corner")}
        >
          CORNER
        </Button>
        <Button
          className="w-full"
          size={"lg"}
          variant={"outline"}
          onClick={() => setMode("top")}
        >
          TOP
        </Button>
        <Button
          className="w-full"
          size={"lg"}
          variant={"outline"}
          onClick={() => setMode("front")}
        >
          FRONT
        </Button>
      </div>
    </div>
  );
};

export default Remote;
