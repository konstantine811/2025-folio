import { auth, provider } from "@/config/firebase.config";
import { RoutPath } from "@/config/router-config";
import { useAuthStore } from "@/storage/useAuthStore";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router";

const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // <- автоматично відновлює стан збереженого користувача
      navigate(`${RoutPath.TASK_MANAGER}/${RoutPath.TASK_MANAGER_TEMPLATE}`);
    });

    return () => unsubscribe();
  }, [setUser, navigate]); // <- очищаємо підписку при розмонтуванні компонента
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
