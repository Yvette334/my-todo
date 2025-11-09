'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import type { Task } from './lib/tasks/types';
import { readTasks } from './lib/tasks/readTasks';
import { createTask } from './lib/tasks/createTask';
import { updateTask } from './lib/tasks/updateTask';
import { deleteTask } from './lib/tasks/deleteTask';

const emptyTask = {
  title: '',
  description: '',
  priority: 'Low' as Task['priority'],
};

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState(emptyTask);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTasks = useCallback(async (email: string) => {
    if (!email) {
      setTasks([]);
      return;
    }
    const results = await readTasks(email);
    setTasks(results);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user?.email) {
        setUserEmail('');
        setTasks([]);
        setLoading(false);
        router.push('/login');
        return;
      }
      setUserEmail(user.email);
      await loadTasks(user.email);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadTasks, router]);

  const resetForm = () => {
    setForm(emptyTask);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userEmail || saving) return;

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title || !description) {
      setMessage('Please fill in both the title and description.');
      return;
    }

    try {
      setSaving(true);
      setMessage('');

      if (editingId) {
        await updateTask(editingId, {
          title,
          description,
          priority: form.priority,
        });
      } else {
        await createTask({
          title,
          description,
          priority: form.priority,
          completed: false,
          userEmail,
        });
      }

      await loadTasks(userEmail);
      resetForm();
    } catch (error) {
      console.error(error);
      setMessage('Unable to save the task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = useCallback(
    async (task: Task) => {
      try {
        await updateTask(task.id, { completed: !task.completed });
        await loadTasks(userEmail);
      } catch (error) {
        console.error(error);
        setMessage('Could not update that task.');
      }
    },
    [loadTasks, userEmail]
  );

  const handleDelete = useCallback(
    async (taskId: string) => {
      try {
        await deleteTask(taskId);
        await loadTasks(userEmail);
      } catch (error) {
        console.error(error);
        setMessage('Could not delete that task.');
      }
    },
    [loadTasks, userEmail]
  );

  const handleEdit = (task: Task) => {
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
    });
    setEditingId(task.id);
    setMessage('');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error(error);
      setMessage('Unable to log out. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading dashboard…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <section className="rounded-2xl border border-slate-800/60 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Hello, {userEmail || 'Guest'}</h1>
              <p className="text-sm text-slate-400">Stay organised with your personal task board.</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full bg-linear-to-r from-orange-400 to-amber-500 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-orange-500/30 transition hover:from-orange-300 hover:to-amber-400"
            >
              Logout
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800/60 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40">
          <h2 className="mb-4 text-xl font-semibold">
            {editingId ? 'Update task details' : 'Add a new task'}
          </h2>
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Task title"
              className="rounded-xl border border-slate-700/60 bg-slate-950/50 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
            />
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Describe what needs to be done"
              rows={3}
              className="rounded-xl border border-slate-700/60 bg-slate-950/50 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
            />
            <select
              value={form.priority}
              onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value as Task['priority'] }))}
              className="rounded-xl border border-slate-700/60 bg-slate-950/50 px-4 py-3 text-sm focus:border-blue-400 focus:outline-none"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-linear-to-r from-sky-400 to-indigo-500 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/30 transition hover:from-sky-300 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Saving…' : editingId ? 'Update task' : 'Add task'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-700/60 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          {message && <p className="mt-3 text-sm font-medium text-rose-300">{message}</p>}
        </section>

        <section className="rounded-2xl border border-slate-800/60 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/40">
          <h2 className="mb-4 text-xl font-semibold">Your tasks</h2>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-400">No tasks yet. Add one above to get started.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-800/60 bg-slate-950/50 px-4 py-4 shadow-lg shadow-slate-950/20 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-100">
                      {task.title}
                      <span className="ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-300">
                        {task.priority}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{task.description}</p>
                    <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task)}
                        className="h-4 w-4 rounded border-slate-600 text-blue-500 focus:ring-blue-400"
                      />
                      Completed
                    </label>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <button
                      onClick={() => handleEdit(task)}
                      className="rounded-lg border border-slate-700/60 px-3 py-2 font-medium text-slate-200 transition hover:bg-slate-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="rounded-lg bg-linear-to-r from-rose-500 to-red-500 px-3 py-2 font-medium text-rose-50 shadow-md shadow-rose-500/30 transition hover:from-rose-400 hover:to-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
