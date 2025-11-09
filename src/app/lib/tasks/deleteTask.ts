// app/lib/tasks/deleteTask.ts
import { db } from '../firebase'
import { doc, deleteDoc } from 'firebase/firestore'

export async function deleteTask(id: string) {
  try {
    await deleteDoc(doc(db, 'tasks', id))
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}
