// app/lib/tasks/updateTask.ts
import { db } from '../firebase'
import { doc, updateDoc } from 'firebase/firestore'

export async function updateTask(id: string, data: Partial<any>) {
  try {
    await updateDoc(doc(db, 'tasks', id), data)
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}
