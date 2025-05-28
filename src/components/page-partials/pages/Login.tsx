import { useTranslation } from "react-i18next";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { Tilt } from "@/components/ui/tilt";
import { Spotlight } from "@/components/ui/spotlight";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import WrapperHoverElement from "@/components/ui-abc/wrapper-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import { useLocation, useNavigate } from "react-router";
import useFirebaseLogin from "@/hooks/auth/firebase-login";
import { RoutPath } from "@/config/router-config";

const LoginPage = () => {
  const [t] = useTranslation();
  const hS = useHeaderSizeStore((state) => state.size);
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogin } = useFirebaseLogin();
  // ⬇️ Витягуємо параметр redirect з URL
  const params = new URLSearchParams(location.search);
  const redirectPath = params.get("redirect");
  const handleUserLogin = async () => {
    const user = await handleLogin();
    if (user) {
      if (redirectPath && redirectPath !== RoutPath.LOGIN) {
        navigate(redirectPath);
      } else {
        navigate(RoutPath.HOME);
      }
    }
  };
  return (
    <div
      className="flex items-center justify-center py-10 "
      style={{ minHeight: `calc(100vh - ${hS}px)` }}
    >
      <WrapperHoverElement>
        <SoundHoverElement
          onClick={handleUserLogin}
          hoverTypeElement={SoundTypeElement.LOGO}
          hoverStyleElement={HoverStyleElement.quad}
          className="aspect-video max-w-sm border border-foreground/20 p-5 rounded-2xl"
        >
          <Tilt
            rotationFactor={10}
            isRevese
            style={{
              transformOrigin: "center center",
            }}
            springOptions={{
              stiffness: 26.7,
              damping: 4.1,
              mass: 0.2,
            }}
            className="group relative rounded-lg"
          >
            <Spotlight
              className="z-10 from-foreground/50 via-accent/20 to-accent/10 blur-2xl"
              size={248}
              springOptions={{
                stiffness: 26.7,
                damping: 4.1,
                mass: 0.2,
              }}
            />
            <img
              // src='https://images.beta.cosmos.so/f7fcb95d-981b-4cb3-897f-e35f6c20e830?format=jpeg'
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/500px-Google_2015_logo.svg.png"
              alt={t("login.to_google")}
              className="rounded-lg object-cover grayscale duration-700 group-hover:grayscale-0"
            />
          </Tilt>
          <div className="flex flex-col space-y-0.5 pb-0 pt-3">
            <h3 className="font-mono text-sm font-medium text-foreground/40 text-center">
              {t("login.to_google")}
            </h3>
          </div>
        </SoundHoverElement>
      </WrapperHoverElement>
    </div>
  );
};

export default LoginPage;
