import { auth, db, FirebaseCollection } from "@/config/firebase.config";
import { Items } from "@/types/drag-and-drop.model";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const saveDailyTasks = async (items: Items) => {
  const user = await waitForUserAuth();
  if (!user) {
    console.warn("❌ Cannot save tasks. User not authenticated.");
    return;
  }

  const uid = user.uid;
  const ref = doc(db, FirebaseCollection.dailyTasks, uid);

  try {
    await setDoc(ref, {
      updatedAt: new Date().toISOString(),
      email: user.email,
      items,
    });

    // console.info("✅ Tasks saved successfully for", uid);
    return;
  } catch (error) {
    console.error("🔥 Error saving tasks:", error);
  }
};

export const loadDailyTasks = async (): Promise<Items | null> => {
  const user = await waitForUserAuth();
  if (!user) return null;

  const ref = doc(db, FirebaseCollection.dailyTasks, user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data().items as Items;
  } else {
    return null;
  }
};

const waitForUserAuth = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub(); // Відписка після першого спрацювання
      resolve(user);
    });
  });
};
