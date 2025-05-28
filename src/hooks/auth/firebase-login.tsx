import { auth } from "@/config/firebase.config";
import { userLogin } from "@/services/firebase/useLogin";
import { useAuthStore } from "@/storage/useAuthStore";
import { signOut } from "firebase/auth";

const useFirebaseLogin = () => {
  const { setUser, logout } = useAuthStore();

  const handleLogin = async () => {
    const user = await userLogin();
    if (user) {
      setUser(user); // зберегти користувача в стані
    }
    return user;
  };

  const handleLogout = async () => {
    await signOut(auth);
    logout(); // очистити стан
  };
  return {
    handleLogin,
    handleLogout,
  };
};

export default useFirebaseLogin;
