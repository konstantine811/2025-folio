import { auth } from "@/config/firebase.config";
import { onAuthStateChanged, User } from "firebase/auth";

export const waitForUserAuth = (): Promise<User | null> =>
  new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
