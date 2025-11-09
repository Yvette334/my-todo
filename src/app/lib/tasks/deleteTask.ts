import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export const deleteTask = async (taskId: string) => {
  await deleteDoc(doc(db, "tasks", taskId));
};
