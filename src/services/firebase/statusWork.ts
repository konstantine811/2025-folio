import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db, FirebaseCollection } from "@config/firebase.config";

export interface StatusWorkData {
  status_work: boolean;
}

const STATUS_WORK_DOC_ID = "status-work";

/**
 * Отримує статус роботи з Firestore
 * @returns Promise з даними статусу або null, якщо документ не знайдено
 */
export const fetchStatusWork = async (): Promise<StatusWorkData | null> => {
  try {
    const docRef = doc(db, FirebaseCollection.statusWork, STATUS_WORK_DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as StatusWorkData;
      return data;
    } else {
      console.warn("⚠️ Status work document not found");
      return null;
    }
  } catch (error) {
    console.error("🔥 Error fetching status work:", error);
    return null;
  }
};

/**
 * Підписується на зміни статусу роботи в реальному часі
 * @param callback - функція, яка викликається при зміні даних
 * @returns функція для відписки від змін
 */
export const subscribeToStatusWork = (
  callback: (data: StatusWorkData | null) => void
): (() => void) => {
  const docRef = doc(db, FirebaseCollection.statusWork, STATUS_WORK_DOC_ID);

  const unsubscribe = onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as StatusWorkData;
        callback(data);
      } else {
        console.warn("⚠️ Status work document not found");
        callback(null);
      }
    },
    (error) => {
      console.error("🔥 Error subscribing to status work:", error);
      callback(null);
    }
  );

  return unsubscribe;
};
