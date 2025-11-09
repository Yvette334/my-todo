import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import type { Task } from "./types";

export type CreateTaskInput = Omit<Task, "id">;

export const createTask = async (data: CreateTaskInput) => {
  const ref = await addDoc(collection(db, "tasks"), data);
  return ref.id;
};
