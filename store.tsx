import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, Project, Task, Prompt, Language, Theme } from './types';
import { v4 as uuidv4 } from 'uuid';

interface StoreContextType extends AppState {
  addProject: (name: string) => void;
  updateProjectName: (id: string, name: string) => void;
  deleteProject: (id: string) => void; // Moves to trash
  restoreProject: (id: string) => void;
  permanentlyDeleteProject: (id: string) => void;
  reorderProjects: (projects: Project[]) => void;
  
  addTask: (projectId: string, name: string) => void;
  updateTaskName: (projectId: string, taskId: string, name: string) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  restoreTask: (projectId: string, taskId: string) => void;
  permanentlyDeleteTask: (projectId: string, taskId: string) => void;
  reorderTasks: (projectId: string, tasks: Task[]) => void;
  
  addPrompt: (projectId: string, taskId: string, title: string, content: string) => void;
  updatePrompt: (projectId: string, taskId: string, promptId: string, updates: Partial<Prompt>) => void;
  deletePrompt: (projectId: string, taskId: string, promptId: string) => void;
  restorePrompt: (projectId: string, taskId: string, promptId: string) => void;
  permanentlyDeletePrompt: (projectId: string, taskId: string, promptId: string) => void;
  reorderPrompts: (projectId: string, taskId: string, prompts: Prompt[]) => void;

  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setCurrentProject: (id: string | null) => void;
  setCurrentTaskId: (id: string | null) => void;
  toggleTrash: () => void;
  toggleBeProud: (isOpen: boolean) => void;
  setViewMode: (mode: 'list' | 'flow') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Marketing Campaign',
    createdAt: Date.now(),
    deletedAt: null,
    tasks: [
      {
        id: 't1',
        name: 'Social Media',
        deletedAt: null,
        prompts: [
          { id: 'p1', title: 'Instagram Caption', content: 'Create a witty caption for a coffee shop...', createdAt: Date.now(), deletedAt: null },
          { id: 'p2', title: 'LinkedIn Post', content: 'Write a professional post about AI productivity...', createdAt: Date.now(), deletedAt: null }
        ]
      }
    ]
  }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>('1');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>('t1');
  const [settings, setSettings] = useState<{ language: Language; theme: Theme }>({ language: 'it', theme: 'light' });
  const [ui, setUi] = useState<AppState['ui']>({ isTrashOpen: false, isBeProudOpen: false, viewMode: 'list' });

  // Handle Theme Side Effects
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Clean up trash older than 24h
  useEffect(() => {
    const interval = setInterval(() => {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      setProjects(prev => {
        return prev.filter(p => !p.deletedAt || p.deletedAt > oneDayAgo).map(p => ({
            ...p,
            tasks: p.tasks.filter(t => !t.deletedAt || t.deletedAt > oneDayAgo).map(t => ({
                ...t,
                prompts: t.prompts.filter(pr => !pr.deletedAt || pr.deletedAt > oneDayAgo)
            }))
        }));
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // --- Projects ---
  const addProject = (name: string) => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      createdAt: Date.now(),
      tasks: [],
    };
    setProjects(prev => [...prev, newProject]);
    setCurrentProjectId(newProject.id);
    setCurrentTaskId(null);
  };

  const updateProjectName = (id: string, name: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, deletedAt: Date.now() } : p));
    if (currentProjectId === id) {
      setCurrentProjectId(null);
      setCurrentTaskId(null);
    }
  };

  const restoreProject = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, deletedAt: null } : p));
  };

  const permanentlyDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const reorderProjects = (newOrder: Project[]) => {
    setProjects(prev => {
        const trashItems = prev.filter(p => p.deletedAt);
        return [...newOrder, ...trashItems];
    });
  };

  // --- Tasks ---
  const addTask = (projectId: string, name: string) => {
    const newTask: Task = { id: uuidv4(), name, prompts: [] };
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, tasks: [...p.tasks, newTask] };
      }
      return p;
    }));
    setCurrentTaskId(newTask.id);
  };

  const updateTaskName = (projectId: string, taskId: string, name: string) => {
     setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, name } : t)
        };
      }
      return p;
    }));
  };

  const deleteTask = (projectId: string, taskId: string) => {
     setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { 
            ...p, 
            tasks: p.tasks.map(t => t.id === taskId ? { ...t, deletedAt: Date.now() } : t)
        };
      }
      return p;
    }));
    if (currentTaskId === taskId) setCurrentTaskId(null);
  };

  const restoreTask = (projectId: string, taskId: string) => {
     setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { 
            ...p, 
            tasks: p.tasks.map(t => t.id === taskId ? { ...t, deletedAt: null } : t)
        };
      }
      return p;
    }));
  };

  const permanentlyDeleteTask = (projectId: string, taskId: string) => {
     setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) };
      }
      return p;
    }));
  };

  const reorderTasks = (projectId: string, newTasks: Task[]) => {
    setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            // Keep deleted tasks in the array, just move them to end or merge
            const currentDeleted = p.tasks.filter(t => t.deletedAt);
            return { ...p, tasks: [...newTasks, ...currentDeleted] };
        }
        return p;
    }));
  };

  // --- Prompts ---
  const addPrompt = (projectId: string, taskId: string, title: string, content: string) => {
    const newPrompt: Prompt = { id: uuidv4(), title, content, createdAt: Date.now() };
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id === taskId) {
              return { ...t, prompts: [newPrompt, ...t.prompts] };
            }
            return t;
          })
        };
      }
      return p;
    }));
  };

  const updatePrompt = (projectId: string, taskId: string, promptId: string, updates: Partial<Prompt>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id === taskId) {
              return {
                ...t,
                prompts: t.prompts.map(prompt => prompt.id === promptId ? { ...prompt, ...updates } : prompt)
              };
            }
            return t;
          })
        };
      }
      return p;
    }));
  };

  const deletePrompt = (projectId: string, taskId: string, promptId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id === taskId) {
              return { 
                  ...t, 
                  prompts: t.prompts.map(pr => pr.id === promptId ? { ...pr, deletedAt: Date.now() } : pr)
              };
            }
            return t;
          })
        };
      }
      return p;
    }));
  };

  const restorePrompt = (projectId: string, taskId: string, promptId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id === taskId) {
              return { 
                  ...t, 
                  prompts: t.prompts.map(pr => pr.id === promptId ? { ...pr, deletedAt: null } : pr)
              };
            }
            return t;
          })
        };
      }
      return p;
    }));
  };

  const permanentlyDeletePrompt = (projectId: string, taskId: string, promptId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => {
            if (t.id === taskId) {
              return { ...t, prompts: t.prompts.filter(pr => pr.id !== promptId) };
            }
            return t;
          })
        };
      }
      return p;
    }));
  };

  const reorderPrompts = (projectId: string, taskId: string, newPrompts: Prompt[]) => {
    setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
            return {
                ...p,
                tasks: p.tasks.map(t => {
                    if (t.id === taskId) {
                        const currentDeleted = t.prompts.filter(pr => pr.deletedAt);
                        return { ...t, prompts: [...newPrompts, ...currentDeleted] };
                    }
                    return t;
                })
            };
        }
        return p;
    }));
  };

  // --- Common ---
  const setLanguage = (lang: Language) => setSettings(prev => ({ ...prev, language: lang }));
  const setTheme = (theme: Theme) => setSettings(prev => ({ ...prev, theme }));
  const toggleTrash = () => setUi(prev => ({ ...prev, isTrashOpen: !prev.isTrashOpen }));
  const toggleBeProud = (isOpen: boolean) => setUi(prev => ({ ...prev, isBeProudOpen: isOpen }));
  const setViewMode = (mode: 'list' | 'flow') => setUi(prev => ({ ...prev, viewMode: mode }));

  const handleSetCurrentProject = (id: string | null) => {
    setCurrentProjectId(id);
    setCurrentTaskId(null);
  };

  return (
    <StoreContext.Provider value={{
      projects, currentProjectId, currentTaskId, settings, ui,
      addProject, updateProjectName, deleteProject, restoreProject, permanentlyDeleteProject, reorderProjects,
      addTask, updateTaskName, deleteTask, restoreTask, permanentlyDeleteTask, reorderTasks,
      addPrompt, updatePrompt, deletePrompt, restorePrompt, permanentlyDeletePrompt, reorderPrompts,
      setLanguage, setTheme, setCurrentProject: handleSetCurrentProject, setCurrentTaskId, toggleTrash, toggleBeProud, setViewMode
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};