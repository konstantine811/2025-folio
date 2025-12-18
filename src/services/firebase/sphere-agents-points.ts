import { db, FirebaseCollection } from "@/config/firebase.config";
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  Unsubscribe,
} from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/config/firebase.config";

export interface SphereAgentPoint {
  id: string;
  lng: number;
  lat: number;
  count: number;
  createdAt: string;
  updatedAt: string;
}

const waitForUserAuth = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const saveSphereAgentPoint = async (
  point: Omit<SphereAgentPoint, "id" | "createdAt" | "updatedAt">
) => {
  const user = await waitForUserAuth();
  if (!user) {
    console.warn("❌ Cannot save point. User not authenticated.");
    return;
  }

  const uid = user.uid;
  const docRef = doc(db, FirebaseCollection.sphereAgentsPoints, uid);

  try {
    const docSnap = await getDoc(docRef);
    const now = new Date().toISOString();
    const newPoint: SphereAgentPoint = {
      ...point,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    if (docSnap.exists()) {
      const existingData = docSnap.data();
      const points = existingData.points || [];
      points.push(newPoint);

      await updateDoc(docRef, {
        points,
        updatedAt: now,
      });
    } else {
      await setDoc(docRef, {
        points: [newPoint],
        createdAt: now,
        updatedAt: now,
        email: user.email,
      });
    }

    return newPoint;
  } catch (error) {
    console.error("🔥 Error saving point:", error);
    throw error;
  }
};

export const updateSphereAgentPoint = async (
  pointId: string,
  updates: Partial<Pick<SphereAgentPoint, "count" | "lat" | "lng">>
) => {
  const user = await waitForUserAuth();
  if (!user) {
    console.warn("❌ Cannot update point. User not authenticated.");
    return;
  }

  const uid = user.uid;
  const docRef = doc(db, FirebaseCollection.sphereAgentsPoints, uid);

  try {
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Document does not exist");
    }

    const existingData = docSnap.data();
    const points: SphereAgentPoint[] = existingData.points || [];
    const pointIndex = points.findIndex((p) => p.id === pointId);

    if (pointIndex === -1) {
      throw new Error("Point not found");
    }

    points[pointIndex] = {
      ...points[pointIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(docRef, {
      points,
      updatedAt: new Date().toISOString(),
    });

    return points[pointIndex];
  } catch (error) {
    console.error("🔥 Error updating point:", error);
    throw error;
  }
};

export const deleteSphereAgentPoint = async (pointId: string) => {
  const user = await waitForUserAuth();
  if (!user) {
    console.warn("❌ Cannot delete point. User not authenticated.");
    return;
  }

  const uid = user.uid;
  const docRef = doc(db, FirebaseCollection.sphereAgentsPoints, uid);

  try {
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Document does not exist");
    }

    const existingData = docSnap.data();
    const points: SphereAgentPoint[] = existingData.points || [];
    const filteredPoints = points.filter((p) => p.id !== pointId);

    await updateDoc(docRef, {
      points: filteredPoints,
      updatedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error("🔥 Error deleting point:", error);
    throw error;
  }
};

export const getSphereAgentPoints = async (): Promise<SphereAgentPoint[]> => {
  const user = await waitForUserAuth();
  if (!user) {
    console.warn("❌ Cannot get points. User not authenticated.");
    return [];
  }

  const uid = user.uid;
  const docRef = doc(db, FirebaseCollection.sphereAgentsPoints, uid);

  try {
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return [];
    }

    const data = docSnap.data();
    return data.points || [];
  } catch (error) {
    console.error("🔥 Error getting points:", error);
    return [];
  }
};

export const subscribeToSphereAgentPoints = (
  callback: (points: SphereAgentPoint[]) => void
): Unsubscribe => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback([]);
      return;
    }

    const uid = user.uid;
    const docRef = doc(db, FirebaseCollection.sphereAgentsPoints, uid);

    return onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) {
        callback([]);
        return;
      }

      const data = docSnap.data();
      callback(data.points || []);
    });
  });

  return unsubscribe;
};
