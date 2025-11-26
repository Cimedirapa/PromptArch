import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Plus, Trash2, Edit2, Check, GripVertical } from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { Task } from '../types';

interface TaskItemProps {
    task: Task;
    currentTaskId: string | null;
    setCurrentTaskId: (id: string | null) => void;
    startEdit: (id: string, name: string) => void;
    deleteTask: (pid: string, tid: string) => void;
    currentProjectId: string;
    editingId: string | null;
    editName: string;
    setEditName: (n: string) => void;
    saveEdit: () => void;
    setEditingId: (id: string | null) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
    task,
    currentTaskId,
    setCurrentTaskId,
    startEdit,
    deleteTask,
    currentProjectId,
    editingId,
    editName,
    setEditName,
    saveEdit,
    setEditingId
}) => {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={task}
            dragListener={false}
            dragControls={controls}
            className="relative"
            as="div"
        >
            <div
                onClick={() => setCurrentTaskId(task.id)}
                className={`
                    group relative flex items-center gap-2 pl-2 pr-4 py-2 rounded-full cursor-pointer border transition-all min-w-[150px] justify-between
                    ${currentTaskId === task.id 
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border-zinc-900 dark:border-zinc-100' 
                        : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                    }
                `}
            >
                {/* Drag Handle */}
                <div 
                    onPointerDown={(e) => controls.start(e)}
                    className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                     <GripVertical size={12} />
                </div>

                {editingId === task.id ? (
                        <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
                        <input 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-transparent border-b border-violet-500 text-sm focus:outline-none dark:text-black"
                            autoFocus
                        />
                        <button onClick={saveEdit} className="text-green-500"><Check size={12} /></button>
                    </div>
                ) : (
                    <>
                        <span className="text-sm font-medium select-none truncate max-w-[100px]">{task.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                            <button 
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => { e.stopPropagation(); startEdit(task.id, task.name); }}
                                className="hover:text-violet-400"
                            >
                                <Edit2 size={12} />
                            </button>
                            <button 
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    deleteTask(currentProjectId, task.id); 
                                }}
                                className="hover:text-white hover:bg-red-500 rounded p-0.5 transition-all duration-200 hover:scale-110"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Reorder.Item>
    )
}

export const Topbar: React.FC = () => {
  const { 
    projects, currentProjectId, currentTaskId, setCurrentTaskId, 
    addTask, deleteTask, updateTaskName, reorderTasks
  } = useStore();

  const [newTaskName, setNewTaskName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentProject = projects.find(p => p.id === currentProjectId);
  
  // Filter visible tasks
  const visibleTasks = currentProject ? currentProject.tasks.filter(t => !t.deletedAt) : [];
  
  // Handle Horizontal Scroll with Mouse Wheel
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  if (!currentProject || currentProject.deletedAt) return (
    <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center px-6">
        <span className="text-zinc-400 text-sm">Select or create a project</span>
    </div>
  );

  const handleAddTask = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTaskName.trim()) {
      addTask(currentProject.id, newTaskName.trim());
      setNewTaskName('');
    }
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      updateTaskName(currentProject.id, editingId, editName.trim());
      setEditingId(null);
    }
  };

  const handleReorder = (newTasks: Task[]) => {
      reorderTasks(currentProject.id, newTasks);
  };

  return (
    <div 
        ref={scrollContainerRef}
        className="h-16 min-h-[4rem] border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center px-4 overflow-x-auto no-scrollbar"
    >
       <div className="flex items-center gap-4">
        {/* New Task Input */}
        <div className="relative min-w-[200px]">
             <input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                onKeyDown={handleAddTask}
                placeholder="New Task..."
                className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-full px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all border border-transparent focus:border-violet-500"
            />
             <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <Plus size={14} />
             </div>
        </div>

        <Reorder.Group 
            axis="x" 
            values={visibleTasks} 
            onReorder={handleReorder}
            className="flex items-center gap-4"
        >
            <AnimatePresence mode='popLayout'>
                {visibleTasks.map(task => (
                    <TaskItem 
                        key={task.id}
                        task={task}
                        currentTaskId={currentTaskId}
                        setCurrentTaskId={setCurrentTaskId}
                        startEdit={startEdit}
                        deleteTask={deleteTask}
                        currentProjectId={currentProject.id}
                        editingId={editingId}
                        editName={editName}
                        setEditName={setEditName}
                        saveEdit={saveEdit}
                        setEditingId={setEditingId}
                    />
                ))}
            </AnimatePresence>
        </Reorder.Group>
       </div>
    </div>
  );
};