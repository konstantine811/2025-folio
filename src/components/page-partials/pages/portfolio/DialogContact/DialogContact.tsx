import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { sendContactRequest } from "../../experimental/three-scenes/ai-three/api/apiClient";
import InputTextWrapper from "@/components/ui-abc/inputs/input-text-wrapper";
import { ArrowRight, Mail } from "lucide-react";
import TextareaWrapper from "@/components/ui-abc/inputs/textarea-wrapper";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";

const DialogContact = () => {
  const [t] = useTranslation();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: formData.get("first-name") + " " + formData.get("last-name"),
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };
    setIsLoading(true);
    try {
      const data = await sendContactRequest(payload);
      if (data.ok) {
        toast.success(t("portfolio.contact_modal.success_message"));
        form.reset();
        setOpen(false);
      } else {
        toast.error(t("portfolio.contact_modal.error_message"));
      }
    } catch {
      toast.error(t("portfolio.contact_modal.error_message"));
    }
    setIsLoading(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="cursor-pointer text-xs font-mono uppercase text-muted-foreground hover:text-foreground transition-colors">
          {t("portfolio.contact")}
        </span>
      </DialogTrigger>
      <DialogOverlay className="backdrop-blur-xs" />

      {/* Form must live inside DialogContent (portal) so inputs are inside the form */}
      <DialogContent className="max-w-lg w-full order border-foreground/10 rounded-lg shadow-2xl max-h-[90vh] flex flex-col p-0">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto flex-1 ">
            <DialogHeader className="p-6 border-b border-foreground/10">
              <DialogTitle className="font-display font-normal text-2xl text-foreground tracking-tight">
                {t("portfolio.contact_modal.title")}
              </DialogTitle>
              <DialogDescription className="font-mono text-xs text-muted-foreground">
                {t("portfolio.contact_modal.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 p-6">
              <div className="grid grid-cols-2 gap-6">
                <InputTextWrapper
                  id="first-name"
                  label={t("portfolio.contact_modal.first_name")}
                  placeholder={t(
                    "portfolio.contact_modal.first_name_placeholder"
                  )}
                />
                <InputTextWrapper
                  id="last-name"
                  label={t("portfolio.contact_modal.last_name")}
                  placeholder={t(
                    "portfolio.contact_modal.last_name_placeholder"
                  )}
                />
              </div>
              <InputTextWrapper
                id="email"
                label={t("portfolio.contact_modal.email")}
                placeholder={t("portfolio.contact_modal.email_placeholder")}
                icon={<Mail />}
              />
              <div className="grid gap-3">
                <TextareaWrapper
                  id="message"
                  label={t("portfolio.contact_modal.message")}
                  placeholder={t("portfolio.contact_modal.message_placeholder")}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 w-full flex items-center !justify-between">
            <span className="font-mono text-[10px] text-zinc-600">
              {t("portfolio.contact_modal.avg_response")}
            </span>
            <Button
              variant="secondary"
              className="text-xs !px-6 text-background hover:text-background hover:bg-foreground transition-all cursor-pointer group"
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner className="size-4" />
              ) : (
                <>
                  <span>{t("portfolio.contact_modal.send")}</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.5] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogContact;
