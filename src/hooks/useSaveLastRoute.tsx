import { LocalStorageKey } from "@/config/local-storage.config";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export const useSaveLastRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const lastRoute = getLastRoute();

    // Якщо це перший візит і ми на root ("/"), перенаправити
    if (
      location.pathname === "/" &&
      lastRoute &&
      lastRoute !== "/" &&
      lastRoute !== location.pathname
    ) {
      navigate(lastRoute, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    // Не зберігай технічні маршрути (логін, 404, і т.п.)
    if (location.pathname !== "/login") {
      localStorage.setItem(
        LocalStorageKey.lastRoute,
        location.pathname + location.search
      );
    }
  }, [location]);
};

export const getLastRoute = (): string | null => {
  return localStorage.getItem(LocalStorageKey.lastRoute);
};
