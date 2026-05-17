import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db, FirebaseCollection } from "@config/firebase.config";

export interface StatusWorkData {
  status_work: boolean;
}

const STATUS_WORK_DOC_ID = "status-work";
const DEFAULT_STATUS_WORK: StatusWorkData = { status_work: false };

const isPermissionDeniedError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "permission-denied";

const shouldSkipRealtimeStatusWork = () => {
  if (import.meta.env.VITE_ENABLE_STATUS_WORK_REALTIME === "true") {
    return false;
  }

  if (typeof window === "undefined") {
    return false;
  }

  return (
    import.meta.env.DEV &&
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
  );
};

/**
 * Отримує статус роботи з Firestore
 * @returns Promise з даними статусу або null, якщо документ не знайдено
 */
export const fetchStatusWork = async (): Promise<StatusWorkData | null> => {
  try {
    const docRef = doc(db, FirebaseCollection.statusWork, STATUS_WORK_DOC_ID);
    const snap = await getDoc(docRef);

    return snap.exists()
      ? (snap.data() as StatusWorkData)
      : DEFAULT_STATUS_WORK;
  } catch (error) {
    if (isPermissionDeniedError(error)) {
      console.warn(
        "Status work is not readable with the current Firestore rules. Using the local fallback status."
      );
    } else {
      console.error("Error fetching status work:", error);
    }

    return DEFAULT_STATUS_WORK;
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
  if (shouldSkipRealtimeStatusWork()) {
    callback(DEFAULT_STATUS_WORK);
    return () => {};
  }

  const docRef = doc(db, FirebaseCollection.statusWork, STATUS_WORK_DOC_ID);

  const unsubscribe = onSnapshot(
    docRef,
    (snap) => {
      callback(
        snap.exists() ? (snap.data() as StatusWorkData) : DEFAULT_STATUS_WORK
      );
    },
    (error) => {
      if (isPermissionDeniedError(error)) {
        console.warn(
          "Status work realtime updates are not readable with the current Firestore rules. Using the fallback status."
        );
      } else {
        console.error("Error subscribing to status work:", error);
      }

      callback(DEFAULT_STATUS_WORK);
    }
  );

  return unsubscribe;
};
