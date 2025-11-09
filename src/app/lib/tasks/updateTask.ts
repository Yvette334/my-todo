import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { Task } from "./types";

export type UpdateTaskInput = Partial<Omit<Task, "id" | "userEmail" | "completed">> & {
  completed?: boolean;
};

export const updateTask = async (taskId: string, data: UpdateTaskInput) => {
  await updateDoc(doc(db, "tasks", taskId), data);
};
