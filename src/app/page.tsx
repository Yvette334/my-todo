'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import type { Task } from './lib/tasks/types';

const styles = {
  page: {
    minHeight: '100vh',
    margin: 0,
    padding: '32px 16px',
    fontFamily: '"Segoe UI", Arial, sans-serif',
    background: 'linear-gradient(135deg, #020617, #0f172a)',
    color: '#f8fafc',
    boxSizing: 'border-box' as const,
  },
  layout: {
    maxWidth: '880px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 24px 48px rgba(15, 23, 42, 0.45)',
    border: '1px solid rgba(148, 163, 184, 0.22)',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },
  heading: {
    margin: 0,
    fontSize: '26px',
    fontWeight: 600,
  },
  subheading: {
    margin: '6px 0 0',
    fontSize: '14px',
    color: '#c7d2fe',
  },
  logoutButton: {
    border: 'none',
    borderRadius: '999px',
    padding: '10px 20px',
    fontWeight: 600,
    backgroundColor: '#f97316',
    color: '#0f172a',
    boxShadow: '0 14px 36px rgba(249, 115, 22, 0.35)',
    cursor: 'pointer',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: '0 0 16px 0',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  input: {
    width: '100%',
    borderRadius: '12px',
    border: '1px solid rgba(148, 163, 184, 0.28)',
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
    padding: '12px 14px',
    color: '#f8fafc',
    fontSize: '15px',
  },
  textarea: {
    minHeight: '100px',
    resize: 'vertical' as const,
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
    flexWrap: 'wrap' as const,
  },
  primaryButton: {
    border: 'none',
    borderRadius: '12px',
    padding: '12px 20px',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
    color: '#0f172a',
    cursor: 'pointer',
  },
  secondaryButton: {
    border: '1px solid rgba(148, 163, 184, 0.35)',
    borderRadius: '12px',
    padding: '12px 20px',
    fontWeight: 600,
    backgroundColor: 'transparent',
    color: '#cbd5f5',
    cursor: 'pointer',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(248, 113, 113, 0.35)',
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    color: '#fecaca',
    fontSize: '14px',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '18px',
  },
  taskCard: {
    borderRadius: '16px',
    padding: '18px',
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  taskTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 600,
  },
  taskDescription: {
    margin: '4px 0 0',
    fontSize: '14px',
    color: '#e2e8f0',
  },
  taskMeta: {
    margin: 0,
    fontSize: '12px',
    color: '#93c5fd',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#cbd5f5',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const,
  },
  actionButton: {
    border: 'none',
    borderRadius: '999px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
} as const;

const PRIORITIES: Task['priority'][] = ['Low', 'Medium', 'High'];

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('Low');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadTasks = useCallback(async (email: string) => {
    if (!email) {
      setTasks([]);
      return;
    }
    const ref = collection(db, 'tasks');
    const q = query(ref, where('userEmail', '==', email));
    const snapshot = await getDocs(q);
    const items: Task[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Omit<Task, 'id'>;
      return { id: docSnap.id, ...data };
    });
    setTasks(items);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user?.email) {
        setUserEmail('');
        setTasks([]);
        setIsLoading(false);
        router.push('/login');
        return;
      }
      setUserEmail(user.email);
      await loadTasks(user.email);
      setIsLoading(false);
    });

    return () => unsub();
  }, [loadTasks, router]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('Low');
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!userEmail || isSaving) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setMessage('Please fill in both the title and description.');
      return;
    }

    try {
      setIsSaving(true);
      setMessage('');

      if (editingId) {
        await updateDoc(doc(db, 'tasks', editingId), {
          title: trimmedTitle,
          description: trimmedDescription,
          priority,
        });
      } else {
        await addDoc(collection(db, 'tasks'), {
          title: trimmedTitle,
          description: trimmedDescription,
          priority,
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
      setIsSaving(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: !task.completed,
      });
      await loadTasks(userEmail);
    } catch (error) {
      console.error(error);
      setMessage('Could not update that task.');
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      await loadTasks(userEmail);
    } catch (error) {
      console.error(error);
      setMessage('Could not delete that task.');
    }
  };

  const startEditing = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setEditingId(task.id);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error(error);
      setMessage('Unable to logout. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          ...styles.page,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className=''>
      <div >
        <section>
          <div>
            <div>
              <h1 >Hello, {userEmail || 'Guest'} 👋</h1>
              <p>Stay organised with your private task board.</p>
            </div>
            <button type="button" onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </section>

        <section>
          <h2>
            {editingId ? 'Update task details' : 'Add a new task'}
          </h2>
          <div>
            <input
              placeholder="Task title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <textarea
              placeholder="Describe what you need to do"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as Task['priority'])}
            >
              {PRIORITIES.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}>
              {isSaving ? 'Saving…' : editingId ? 'Update task' : 'Add task'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} style={styles.secondaryButton}>
                Cancel
              </button>
            )}
          </div>
        </section>

        {message && <div>{message}</div>}

        <section>
          <h2>Your tasks</h2>
          {tasks.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#cbd5f5' }}>
              No tasks yet. Add one above to get started.
            </p>
          ) : (
            <div>
              {tasks.map((task) => (
                <article key={task.id} style={styles.taskCard}>
                  <div>
                    <h3>
                      {task.title}
                    </h3>
                    <p style={styles.taskDescription}>{task.description}</p>
                    <p style={styles.taskMeta}>Priority · {task.priority}</p>
                  </div>
                  <label style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    Mark as completed
                  </label>
                  <div style={styles.actions}>
                    <button
                      type="button"
                      onClick={() => startEditing(task)}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        color: '#bfdbfe',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(task.id)}
                      style={{
                        ...styles.actionButton,
                        backgroundColor: 'rgba(248, 113, 113, 0.2)',
                        color: '#fecaca',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
