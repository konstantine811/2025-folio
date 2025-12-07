import { useAuthStore } from "@/storage/useAuthStore";
import { HoverStyleElement, SoundTypeElement } from "@custom-types/sound";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useFirebaseLogin from "@/hooks/auth/firebase-login";
import { Variants } from "framer-motion";
import { MOTION_FRAME_TRANSITION } from "@/config/animations";

const Login = () => {
  const { user } = useAuthStore();
  const [t] = useTranslation();
  const { handleLogin, handleLogout } = useFirebaseLogin();

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ...MOTION_FRAME_TRANSITION.spring3 },
    },
    exit: { opacity: 0, y: 1 }, // 👈 додай це
  };
  if (!user) {
    return (
      <SoundHoverElement
        as="div"
        hoverTypeElement={SoundTypeElement.SELECT}
        hoverStyleElement={HoverStyleElement.none}
        onClick={handleLogin}
        animValue={1.03}
        className="w-auto h-8 p-2 flex  items-center justify-center cursor-pointer bg-card rounded-full border border-muted-foreground/20"
      >
        <div className="flex items-center gap-2">
          <User />
          <span className="font-mono font-thin text-xs text-muted-foreground">
            {t("login.to_google")}
          </span>
        </div>
      </SoundHoverElement>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-3">
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
            <TooltipContent>
              <p className="text-background">{user.email}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="font-mono font-thin text-xs text-muted-foreground">
          {user.displayName}
        </span>
      </div>
      <SoundHoverElement
        as="li"
        variants={itemVariants}
        hoverTypeElement={SoundTypeElement.SELECT}
        hoverStyleElement={HoverStyleElement.none}
        hoverAnimType="scale"
        onClick={handleLogout}
        tooltipText={t("login.out")}
        className="w-8 h-8 p-2 flex items-center justify-center cursor-pointer bg-card  text-muted-foreground hover:text-foreground rounded-full"
      >
        <LogOut />
      </SoundHoverElement>
    </div>
  );
};

export default Login;
