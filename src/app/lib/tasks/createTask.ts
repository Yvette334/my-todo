import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import type { Task } from './types'

export async function createTask(task: Omit<Task, 'id'>) {
  try {
    await addDoc(collection(db, 'tasks'), task)
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}
