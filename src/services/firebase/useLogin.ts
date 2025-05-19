import { auth } from "@/config/firebase.config";
import { useAuthStore } from "@/storage/useAuthStore";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // <- автоматично відновлює стан збереженого користувача
    });

    return () => unsubscribe();
  }, [setUser]);
};

export default useLogin;
