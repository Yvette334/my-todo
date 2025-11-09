'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import type { Task } from './lib/tasks/types';
import { readTasks } from './lib/tasks/readTasks';
import { createTask } from './lib/tasks/createTask';
import { updateTask } from './lib/tasks/updateTask';
import { deleteTask } from './lib/tasks/deleteTask';

export default function DashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('Low');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // ✅ Protect route and load tasks
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user?.email) {
        router.push('/auth/login');
      } else {
        setUserEmail(user.email);
        const loaded = await readTasks(user.email);
        setTasks(loaded);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ✅ Add or update task
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setMessage('Please fill all fields');
      return;
    }

    try {
      if (editingId) {
        await updateTask(editingId, { title, description, priority });
        setMessage('Task updated');
      } else {
        await createTask({ title, description, priority, completed: false, userEmail });
        setMessage('Task added');
      }
      const refreshed = await readTasks(userEmail);
      setTasks(refreshed);
      setTitle('');
      setDescription('');
      setPriority('Low');
      setEditingId(null);
    } catch {
      setMessage('Something went wrong');
    }
  }

  // ✅ Delete a task
  async function handleDelete(id: string) {
    await deleteTask(id);
    const refreshed = await readTasks(userEmail);
    setTasks(refreshed);
  }

  // ✅ Toggle complete
  async function toggleComplete(task: Task) {
    await updateTask(task.id, { completed: !task.completed });
    const refreshed = await readTasks(userEmail);
    setTasks(refreshed);
  }

  // ✅ Edit
  function handleEdit(task: Task) {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
  }

  // ✅ Logout
  async function handleLogout() {
    await signOut(auth);
    router.push('/auth/login');
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Hello, {userEmail}</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 bg-gray-800 p-4 rounded">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full p-2 rounded bg-gray-700 outline-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
            className="w-full p-2 rounded bg-gray-700 outline-none"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task['priority'])}
            className="w-full p-2 rounded bg-gray-700 outline-none"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 w-full"
          >
            {editingId ? 'Update Task' : 'Add Task'}
          </button>
        </form>

        {message && <p className="text-center text-sm text-yellow-400">{message}</p>}

        {/* Task list */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p>No tasks yet</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-800 p-4 rounded flex justify-between items-start"
              >
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-sm text-gray-400">{task.description}</p>
                  <p className="text-xs text-gray-500">Priority: {task.priority}</p>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleComplete(task)}
                    />
                    Completed
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600 text-black"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
