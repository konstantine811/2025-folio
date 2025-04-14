import Header from "@components/page-partials/header-nav/header";

import StickyCursor from "@components/mouse/sticky-cursor";
import { subscribeToHoverSound } from "@services/subscribeHoverAudio";
import { useEffect } from "react";
import { ThemePalette } from "@config/theme-colors.config";
import Map from "@components/map/map";

function App() {
  subscribeToHoverSound();
  useEffect(() => {
    Object.entries(ThemePalette.blue).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }, []);

  useEffect(() => {
    // let deferredPrompt: any;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      console.log("beforeinstallprompt", e);
      // deferredPrompt = e;
      // показати кнопку
    });
  }, []);

  return (
    <>
      <StickyCursor />
      <div className="bg-black">
        <Header />
        <Map />
      </div>
    </>
  );
}

export default App;
