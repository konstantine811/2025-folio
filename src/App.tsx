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
import useLogin from "./services/firebase/useLogin";
import { isTouchDevice } from "./utils/touch-inspect";
import { useResizeListener } from "./hooks/useResizeListener";
function App() {
  subscribeToHoverSound();
  useLogin(); // ✅
  useSetTheme(); // ✅
  const [isTouch, setIsTouch] = useState(false);
  useResizeListener();
  useEffect(() => {
    setIsTouch(isTouchDevice);
  }, []);
  const renderRoutes = (routes: typeof router) =>
    routes.map(({ path, Component, children, id }) => (
      <Route key={id} path={path} element={<Component />}>
        {children && renderRoutes(children)} {/* 🔁 рекурсія */}
      </Route>
    ));
  return (
    <>
      {!isTouch && (
        <>
          <StickyCursor />
          <MouseTrail />
        </>
      )}
      <div className="overflow-x-hidden">
        <Header />
        <Suspense fallback={<Preloader />}>
          <RouteWrapper>
            <Routes>{renderRoutes(router)}</Routes>
          </RouteWrapper>
        </Suspense>
        {/* <Map /> */}
      </div>
      <TransitionPage />
    </>
  );
}

export default App;
