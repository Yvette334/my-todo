import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { Task } from "./types";

export const readTasks = async (email: string): Promise<Task[]> => {
  const ref = collection(db, "tasks");
  const q = query(ref, where("userEmail", "==", email));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Omit<Task, "id">;
    return { id: docSnap.id, ...data };
  });
};
