import { useAuthStore } from "@/storage/useAuthStore";
import { HoverStyleElement, SoundTypeElement } from "@custom-types/sound";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import SelectItem from "@/components/ui-abc/select/select-item";
import { LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useFirebaseLogin from "@/hooks/auth/firebase-login";

const Login = () => {
  const { user } = useAuthStore();
  const [t] = useTranslation();
  const { handleLogin, handleLogout } = useFirebaseLogin();

  if (!user) {
    return (
      <SoundHoverElement
        as="button"
        hoverTypeElement={SoundTypeElement.SELECT}
        hoverStyleElement={HoverStyleElement.none}
        hoverAnimType="scale"
        onClick={handleLogin}
        tooltipText={t("login.to_google")}
        className="w-8 h-8 p-2 flex  items-center justify-center  bg-primary/30 rounded-full"
      >
        <User />
      </SoundHoverElement>
    );
  }

  return (
    <SelectItem
      dropPosition={{
        x: 12,
        y: 0,
      }}
      selectNode={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <img
                referrerPolicy="no-referrer"
                src={user.photoURL || "/logo.svg"}
                alt="User avatar"
                className="w-8 h-8 rounded-full overflow-hidden"
              />
            </TooltipTrigger>
            <TooltipContent side={"left"}>
              <p className="text-background">{user.email}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
      renderItems={(itemVariants) => (
        <>
          <SoundHoverElement
            as="li"
            variants={itemVariants}
            hoverTypeElement={SoundTypeElement.SELECT}
            hoverStyleElement={HoverStyleElement.none}
            hoverAnimType="scale"
            onClick={handleLogout}
            tooltipText={t("login.out")}
            className="w-8 h-8 p-2 flex items-center justify-center  bg-card rounded-full"
          >
            <LogOut />
          </SoundHoverElement>
        </>
      )}
    />
  );
};

export default Login;
