import { auth, provider } from "@/config/firebase.config";
import { useAuthStore } from "@/storage/useAuthStore";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
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

export const userLogin = async () => {
  try {
    auth.languageCode = "en";
    const result = await signInWithPopup(auth, provider);
    return result.user; // Повертаємо користувача після успішного входу
  } catch (err) {
    console.error("Login error:", err);
  }
};

export default useLogin;
