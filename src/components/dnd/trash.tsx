import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react";

const Trash = ({ id }: { id: UniqueIdentifier }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      className={`${
        isOver ? "bg-destructive" : "bg-transparent"
      } fixed right-0 md:top-1/2 md:translate-y-[-50%] bottom-0 w-10 my-auto md:h-1/2 h-20 border rounded-lg flex items-center justify-center text-foreground text-2xl z-50 mb-5 border-destructive transition-all duration-500`}
      ref={setNodeRef}
    >
      <Trash2 />
    </div>
  );
};

export default Trash;
