// app/lib/tasks/readTasks.ts
import { db } from '../firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import type { Task } from './types'

export async function readTasks(userEmail: string): Promise<Task[]> {
  try {
    const q = query(collection(db, 'tasks'), where('userEmail', '==', userEmail))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task))
  } catch (error) {
    console.error('Error reading tasks:', error)
    return []
  }
}
