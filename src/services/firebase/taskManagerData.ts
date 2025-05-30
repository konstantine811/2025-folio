import {
  auth,
  db,
  FirebaseCollection,
  FirebaseCollectionProps,
} from "@/config/firebase.config";
import { Items } from "@/types/drag-and-drop.model";
import { parseDates } from "@/utils/date.util";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

export const saveTemplateTasks = async (items: Items) => {
  const user = await waitForUserAuth();
  if (!user) {
    console.warn("❌ Cannot save tasks. User not authenticated.");
    return;
  }

  const uid = user.uid;
  const ref = doc(db, FirebaseCollection.templateTasks, uid);

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

export const saveDailyTasks = async (items: Items, date: string) => {
  const user = await waitForUserAuth();
  if (!user) {
    console.warn("❌ Cannot save tasks. User not authenticated.");
    return;
  }

  const uid = user.uid;
  // console.info("🗓️ Saving tasks for date:", formattedDate);
  // document path: dailyTasks/{uid}/days/{formattedDate}
  const ref = doc(
    db,
    FirebaseCollection.dailyTasks,
    uid,
    FirebaseCollectionProps[FirebaseCollection.dailyTasks].days,
    date
  );

  try {
    await setDoc(ref, {
      updatedAt: new Date().toISOString(),
      email: user.email,
      items,
    });

    // console.info("✅ Tasks saved successfully for", formattedDate);
  } catch (error) {
    console.error("🔥 Error saving tasks:", error);
  }
};

export const loadTemplateTasks = async (): Promise<Items | null> => {
  const user = await waitForUserAuth();
  if (!user) return null;

  const ref = doc(db, FirebaseCollection.templateTasks, user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data().items as Items;
  } else {
    return null;
  }
};

export const loadDailyTasksByDate = async (
  date: string
): Promise<Items | null> => {
  const user = await waitForUserAuth();
  if (!user) {
    console.warn("❌ Cannot load tasks. User not authenticated.");
    return null;
  }

  const uid = user.uid;

  const ref = doc(
    db,
    FirebaseCollection.dailyTasks,
    uid,
    FirebaseCollectionProps[FirebaseCollection.dailyTasks].days,
    date
  );

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      // console.info("✅ Tasks loaded for date:", formattedDate);
      return snap.data().items as Items;
    } else {
      // console.info("📭 No tasks found for date:", formattedDate);
      return null;
    }
  } catch (error) {
    console.error("🔥 Error loading tasks:", error);
    return null;
  }
};

export const loadAllNonEmptyDailyTaskDates = async (): Promise<Date[]> => {
  const user = await waitForUserAuth();
  if (!user) {
    console.warn("❌ Cannot load task dates. User not authenticated.");
    return [];
  }

  const uid = user.uid;

  const daysCollectionRef = collection(
    db,
    FirebaseCollection.dailyTasks,
    uid,
    FirebaseCollectionProps[FirebaseCollection.dailyTasks].days
  );

  try {
    const querySnapshot = await getDocs(daysCollectionRef);

    const validDates: string[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const items = data.items as Items;

      const hasNonEmptyItems = items && items.length;

      if (hasNonEmptyItems) {
        validDates.push(docSnap.id); // formatted date as "23.05.2025"
      }
    });

    // console.info("📅 Non-empty task dates:", validDates);
    return parseDates(validDates);
  } catch (error) {
    console.error("🔥 Error loading task dates:", error);
    return [];
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
