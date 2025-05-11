import Header from "@components/page-partials/header-nav/header";
import StickyCursor from "@components/mouse/sticky-cursor";
import { subscribeToHoverSound } from "@services/subscribeHoverAudio";
import MouseTrail from "@components/mouse/mouse-trail";
import { Suspense, useEffect, useState } from "react";
import { Routes, Route } from "react-router";
import { router } from "@config/router-config";
import TransitionPage from "@components/page-partials/page-setting/transition-page";
import RouteWrapper from "@components/page-partials/pages/RouteWrapper";
import Preloader from "./components/page-partials/preloader/preloader";
import useSetTheme from "./hooks/useSetTheme";

function App() {
  subscribeToHoverSound();
  useSetTheme();
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);
  return (
    <>
      {!isTouch && (
        <>
          <StickyCursor />
          <MouseTrail />
        </>
      )}
      <div>
        <Header />
        <Suspense fallback={<Preloader />}>
          <RouteWrapper>
            <Routes>
              {router.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<route.Component />}
                />
              ))}
            </Routes>
          </RouteWrapper>
        </Suspense>
        {/* <Map /> */}
      </div>
      <TransitionPage />
    </>
  );
}

export default App;
