import { auth, provider } from "@/config/firebase.config";
import { useAuthStore } from "@/storage/useAuthStore";
import {
  browserSessionPersistence,
  getRedirectResult,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { SoundTypeElement } from "@custom-types/sound";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import SelectItem from "@/components/ui-abc/select/select-item";
import { ArrowRightLeft, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect } from "react";

const Login = () => {
  const { user, setUser, logout } = useAuthStore();
  const [t] = useTranslation();
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch((err) => {
        console.error("Redirect login error:", err);
      });
  }, [setUser]);
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user);
      if (user) setUser(user);
    });
    return () => unsub();
  }, []);
  const handleLogin = async () => {
    try {
      await setPersistence(auth, browserSessionPersistence);

      if (isMobile) {
        signInWithRedirect(auth, provider);
      } else {
        const result = await signInWithPopup(auth, provider);
        setUser(result.user);
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    logout(); // очистити стан
  };

  if (!user) {
    return (
      <SoundHoverElement
        as="button"
        hoverTypeElement={SoundTypeElement.SELECT}
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
            <TooltipContent>
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
            hoverAnimType="scale"
            onClick={handleLogout}
            tooltipText={t("login.out")}
            className="w-8 h-8 p-2 flex items-center justify-center  bg-card rounded-full"
          >
            <LogOut />
          </SoundHoverElement>

          <SoundHoverElement
            as="li"
            variants={itemVariants}
            hoverTypeElement={SoundTypeElement.SELECT}
            hoverAnimType="scale"
            onClick={handleLogin}
            tooltipText={t("login.switch")}
            className="w-8 h-8 p-2  flex items-center justify-center bg-card rounded-full"
          >
            <ArrowRightLeft />
          </SoundHoverElement>
        </>
      )}
    />
  );
};

export default Login;
