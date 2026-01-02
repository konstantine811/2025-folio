import Header from "@components/page-partials/header-nav/header";
import StickyCursor from "@components/mouse/sticky-cursor";
import { subscribeToHoverSound } from "@services/subscribeHoverAudio";
// import MouseTrail from "@components/mouse/mouse-trail";
import { Suspense, useEffect, useState } from "react";
import { Routes, Route } from "react-router";
import { router } from "@config/router-config";
import TransitionPage from "@components/page-partials/page-setting/transition-page";
import RouteWrapper from "@components/page-partials/pages/RouteWrapper";
import Preloader from "./components/page-partials/preloader/preloader";
import useSetTheme from "./hooks/useSetTheme";
import useLogin from "./services/firebase/useLogin";
import { isTouchDevice } from "./utils/touch-inspect";
import { useResizeListener } from "./hooks/useResizeListener";
import { isLocalhost } from "./utils/env-inspect";
import { Toaster } from "sonner";
import Footer from "./components/page-partials/footer/footer";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { preloadSounds } from "./config/sounds";

function App() {
  subscribeToHoverSound();
  useLogin(); // ✅
  useSetTheme(); // ✅
  const [isTouch, setIsTouch] = useState(false);
  useResizeListener();
  useEffect(() => {
    setIsTouch(isTouchDevice);
  }, []);

  // Завантажуємо звуки асинхронно після завантаження сторінки
  useEffect(() => {
    const handleLoad = () => {
      preloadSounds().catch((error) => {
        console.warn("Помилка завантаження звуків:", error);
      });
    };

    if (document.readyState === "complete") {
      // Сторінка вже завантажена
      handleLoad();
    } else {
      // Чекаємо на завантаження сторінки
      window.addEventListener("load", handleLoad);
      return () => {
        window.removeEventListener("load", handleLoad);
      };
    }
  }, []);

  useSmoothScroll(!isTouch); // Увімкнути smooth scroll тільки для non-touch пристроїв

  const renderRoutes = (routes: typeof router) =>
    routes.map(({ path, Component, children, id, isDev }) => {
      if (isDev && !isLocalhost) return null; // ❌ Пропускаємо dev-роути у проді
      return (
        <Route key={id} path={path} element={<Component />}>
          {children && renderRoutes(children)} {/* 🔁 рекурсія */}
        </Route>
      );
    });
  return (
    <>
      {!isTouch && (
        <>
          <StickyCursor />
          {/* <MouseTrail /> */}
        </>
      )}
      <div className="min-h-screen w-full flex flex-col justify-between">
        <Header />
        <div className="grow">
          <Suspense fallback={<Preloader />}>
            <RouteWrapper>
              <Routes>{renderRoutes(router)}</Routes>
            </RouteWrapper>
          </Suspense>
        </div>
        {/* <Map /> */}
        <Footer />
      </div>
      <TransitionPage />
      <Toaster className="border-foreground/10 font-mono" />
    </>
  );
}

export default App;
