import React from 'react';
import { useStore } from '../store';
import { RefreshCcw, X, Trash2, Box, Folder, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, Task, Prompt } from '../types';

export const TrashModal: React.FC = () => {
  const { 
      projects, 
      restoreProject, 
      restoreTask,
      restorePrompt,
      toggleTrash, ui 
  } = useStore();

  if (!ui.isTrashOpen) return null;

  // Aggregate all deleted items
  const deletedItems: Array<{
      type: 'project' | 'task' | 'prompt';
      id: string;
      name: string;
      deletedAt: number;
      projectId: string;
      taskId?: string;
      context: string;
  }> = [];

  projects.forEach(p => {
      if (p.deletedAt) {
          deletedItems.push({
              type: 'project',
              id: p.id,
              name: p.name,
              deletedAt: p.deletedAt,
              projectId: p.id,
              context: 'Project'
          });
      }
      
      p.tasks.forEach(t => {
          if (t.deletedAt) {
              deletedItems.push({
                  type: 'task',
                  id: t.id,
                  name: t.name,
                  deletedAt: t.deletedAt,
                  projectId: p.id,
                  taskId: t.id,
                  context: `Project: ${p.name}`
              });
          }

          t.prompts.forEach(pr => {
              if (pr.deletedAt) {
                  deletedItems.push({
                      type: 'prompt',
                      id: pr.id,
                      name: pr.title,
                      deletedAt: pr.deletedAt,
                      projectId: p.id,
                      taskId: t.id,
                      context: `${p.name} / ${t.name}`
                  });
              }
          });
      });
  });

  // Sort by deletion date (newest first)
  deletedItems.sort((a, b) => b.deletedAt - a.deletedAt);

  const handleRestore = (item: typeof deletedItems[0]) => {
      if (item.type === 'project') restoreProject(item.id);
      if (item.type === 'task') restoreTask(item.projectId, item.id);
      if (item.type === 'prompt') restorePrompt(item.projectId, item.taskId!, item.id);
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'project': return <Box size={16} className="text-violet-500" />;
          case 'task': return <Folder size={16} className="text-blue-500" />;
          case 'prompt': return <FileText size={16} className="text-green-500" />;
          default: return <Trash2 size={16} />;
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[80vh]"
        >
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Trash2 className="text-red-500" /> Trash Bin
                </h2>
                <button onClick={toggleTrash} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <X size={20} className="text-zinc-500" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
                {deletedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-zinc-400">
                        <Trash2 size={32} className="mb-2 opacity-20" />
                        <p>Trash is empty</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {deletedItems.map(item => (
                            <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800 group hover:border-violet-200 dark:hover:border-violet-900/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800">
                                        {getIcon(item.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-zinc-900 dark:text-zinc-200">{item.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                                            <span className="uppercase tracking-wider font-semibold">{item.type}</span>
                                            <span>•</span>
                                            <span className="truncate max-w-[150px]">{item.context}</span>
                                            <span>•</span>
                                            <span>Deleted: {new Date(item.deletedAt).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleRestore(item)}
                                        className="p-2 text-zinc-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors flex items-center gap-2 pr-3"
                                        title="Restore"
                                    >
                                        <RefreshCcw size={18} />
                                        <span className="text-sm font-medium">Restore</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
             <div className="p-4 bg-zinc-50 dark:bg-zinc-950 text-center text-xs text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                Items are permanently deleted after 24 hours.
            </div>
        </motion.div>
    </div>
  );
};