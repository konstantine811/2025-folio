import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useEffect, useState } from "react";
import {
  StatusServer,
  useEditModeStore,
} from "../../../../../store/useEditModeStore";
import { saveScatterToStorage } from "@/services/firebase/cubic-worlds-game/firestore-scatter-objects";

export function ScatterModalWindow() {
  const scatterData = useEditModeStore((s) => s.scatterData);
  const setScatterData = useEditModeStore((s) => s.onSetNewScatter);
  const onSetStatusServer = useEditModeStore((s) => s.setStatusServer);
  const [isOpen, setIsOpen] = useState(false);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (scatterData) {
      setIsOpen(true);
    }
  }, [scatterData]);

  const onHangleCloseDialog = useCallback(() => {
    if (scatterData) {
      onSetStatusServer(StatusServer.start);
      saveScatterToStorage(fileName, scatterData.matrix, {
        ...scatterData.model,
      }).then(() => {
        setScatterData(null);
        setIsOpen(false);
        setFileName("");
        onSetStatusServer(StatusServer.loaded);
      });
    }
  }, [fileName, setScatterData, scatterData, onSetStatusServer]);
  return (
    <Dialog open={isOpen} onOpenChange={onHangleCloseDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle> Scatter Name</DialogTitle>
          <DialogDescription>For saving in the project</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="scatterName" className="sr-only">
              Scatter Name
            </Label>
            <Input
              id="scatterName"
              defaultValue={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={onHangleCloseDialog}
            >
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
