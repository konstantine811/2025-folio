import Header from "@components/page-partials/header-nav/header";
import StickyCursor from "@components/mouse/sticky-cursor";
import { subscribeToHoverSound } from "@services/subscribeHoverAudio";
import MouseTrail from "@components/mouse/mouse-trail";
import { Suspense, useEffect, useState } from "react";
import { Routes, Route } from "react-router";
import { router } from "@config/router-config";
import TransitionPage from "@components/page-partials/page-setting/transition-page";

function App() {
  subscribeToHoverSound();
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
      <div className="bg-background transition transition-background duration-400 ease-in-out h-[300vh]">
        <Header />
        <Suspense fallback={<div>Завантаження сторінки...</div>}>
          <Routes>
            {router.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.Component />}
              />
            ))}
          </Routes>
        </Suspense>
        {/* <Map /> */}
      </div>
      <TransitionPage />
    </>
  );
}

export default App;
