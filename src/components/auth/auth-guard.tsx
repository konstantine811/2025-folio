// components/AuthGuard.tsx
import { ReactNode, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config/firebase.config";
import { Navigate } from "react-router";
import { RoutPath } from "@/config/router-config";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AuthGuard({
  children,
  fallback = "Loading...",
}: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) return <>{fallback}</>;

  if (!isAuthenticated)
    return (
      <Navigate
        to={`${RoutPath.LOGIN}?redirect=${encodeURIComponent(
          location.pathname
        )}`}
        replace
      />
    );

  return <>{children}</>;
}
