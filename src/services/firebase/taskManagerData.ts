import {
  auth,
  db,
  FirebaseCollection,
  FirebaseCollectionProps,
} from "@/config/firebase.config";
import { Items, ItemTaskCategory } from "@/types/drag-and-drop.model";
import { parseDates } from "@/utils/date.util";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  Unsubscribe,
} from "firebase/firestore";

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

export const saveDailyTasks = async <T>(
  items: T,
  date: string,
  collection: FirebaseCollection
) => {
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
    collection,
    uid,
    collection === FirebaseCollection.plannedTasks ||
      collection === FirebaseCollection.dailyTasks
      ? FirebaseCollectionProps[collection].days
      : "",
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

export const loadDailyTasksByDate = async <T>(
  date: string,
  collection: FirebaseCollection
): Promise<T | null> => {
  const user = await waitForUserAuth();
  if (!user) {
    console.warn("❌ Cannot load tasks. User not authenticated.");
    return null;
  }

  const uid = user.uid;

  const ref = doc(
    db,
    collection,
    uid,
    collection === FirebaseCollection.plannedTasks ||
      collection === FirebaseCollection.dailyTasks
      ? FirebaseCollectionProps[collection].days
      : "",
    date
  );

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      // console.info("✅ Tasks loaded for date:", formattedDate);
      return snap.data().items as T;
    } else {
      // console.info("📭 No tasks found for date:", formattedDate);
      return null;
    }
  } catch (error) {
    console.error("🔥 Error loading tasks:", error);
    return null;
  }
};

export const updatePlannedTasksOnServer = async (
  date: string,
  tasks: ItemTaskCategory[]
) => {
  const user = await waitForUserAuth();
  if (!user) throw new Error("User not authenticated");
  const ref = doc(
    db,
    FirebaseCollection.plannedTasks,
    user.uid,
    FirebaseCollectionProps[FirebaseCollection.plannedTasks].days,
    date
  );

  await setDoc(ref, { items: tasks }, { merge: true });
};

export const subscribeToNonEmptyTaskDates = async <
  T extends Items | ItemTaskCategory[]
>(
  collectionType: FirebaseCollection,
  onUpdate: (dates: Date[]) => void
): Promise<Unsubscribe | undefined> => {
  const user = await waitForUserAuth();
  if (!user) {
    console.warn("❌ Cannot subscribe to task dates. User not authenticated.");
    return;
  }

  const uid = user.uid;
  const daysCollectionRef = collection(
    db,
    collectionType,
    uid,
    collectionType === FirebaseCollection.plannedTasks ||
      collectionType === FirebaseCollection.dailyTasks
      ? FirebaseCollectionProps[collectionType].days
      : ""
  );

  const unsubscribe = onSnapshot(daysCollectionRef, (querySnapshot) => {
    const validDates: string[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const items = data.items as T;
      if (items && items.length) {
        validDates.push(docSnap.id);
      }
    });

    onUpdate(parseDates(validDates));
  });

  return unsubscribe;
};

export const subscribeToPlannedTasksWithCounts = async (
  onUpdate: (taskCountPerDate: Record<string, number>) => void
): Promise<Unsubscribe | undefined> => {
  const user = await waitForUserAuth();
  if (!user) {
    console.warn(
      "❌ Cannot subscribe to planned tasks. User not authenticated."
    );
    return;
  }

  const uid = user.uid;
  const daysCollectionRef = collection(
    db,
    FirebaseCollection.plannedTasks,
    uid,
    FirebaseCollectionProps[FirebaseCollection.plannedTasks].days
  );

  const unsubscribe = onSnapshot(daysCollectionRef, (querySnapshot) => {
    const counts: Record<string, number> = {};

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const items = data.items as ItemTaskCategory[];
      if (items && items.length) {
        counts[docSnap.id] = items.length;
      }
    });

    onUpdate(counts); // { '27.05.2025': 3, '28.05.2025': 1 }
  });

  return unsubscribe;
};

export const fetchAllDailyTasks = async () => {
  const user = await waitForUserAuth();
  if (!user) {
    console.warn("❌ Cannot fetch tasks. User not authenticated.");
    return [];
  }

  const uid = user.uid;

  const daysRef = collection(
    db,
    FirebaseCollection.dailyTasks,
    uid,
    FirebaseCollectionProps[FirebaseCollection.dailyTasks].days
  );

  try {
    const snapshot = await getDocs(daysRef);
    const allTasks = snapshot.docs.map((doc) => ({
      date: doc.id,
      ...doc.data(),
    }));

    return allTasks;
  } catch (error) {
    console.error("🔥 Error fetching daily tasks:", error);
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
