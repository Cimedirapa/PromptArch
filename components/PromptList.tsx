import React, { useState } from 'react';
import { useStore } from '../store';
import { Copy, Trash2, Edit2, Plus, ArrowRight, Share2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prompt } from '../types';

interface PromptItemProps {
    prompt: Prompt;
    expandedId: string | null;
    setExpandedId: (id: string | null) => void;
    editingId: string | null;
    setEditingId: (id: string | null) => void;
    editTitle: string;
    setEditTitle: (s: string) => void;
    saveEdit: (id: string) => void;
    startEdit: (id: string, t: string) => void;
    copyToClipboard: (c: string) => void;
    deletePrompt: (pid: string, tid: string, id: string) => void;
    currentProjectId: string;
    currentTaskId: string;
    updatePrompt: (pid: string, tid: string, prid: string, up: Partial<Prompt>) => void;
}

const PromptItem: React.FC<PromptItemProps> = ({
    prompt,
    expandedId,
    setExpandedId,
    editingId,
    setEditingId,
    editTitle,
    setEditTitle,
    saveEdit,
    startEdit,
    copyToClipboard,
    deletePrompt,
    currentProjectId,
    currentTaskId,
    updatePrompt
}) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`bg-white dark:bg-zinc-950 rounded-xl border transition-all duration-300 overflow-hidden ${
                expandedId === prompt.id 
                ? 'border-violet-500 shadow-xl shadow-violet-500/10' 
                : 'border-zinc-200 dark:border-zinc-800 hover:border-violet-300 dark:hover:border-violet-800'
            }`}
        >
            <div className="flex">
                {/* Main Content */}
                <div className="flex-1">
                    {/* Header Bar */}
                    <div 
                        className="p-5 flex items-center justify-between cursor-pointer group"
                        onClick={() => setExpandedId(expandedId === prompt.id ? null : prompt.id)}
                    >
                        <div className="flex-1 pr-4 relative">
                            {editingId === prompt.id ? (
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    <input 
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full bg-transparent border-b border-violet-500 text-lg font-medium focus:outline-none dark:text-white"
                                        autoFocus
                                    />
                                    <button onClick={() => saveEdit(prompt.id)} className="text-green-500"><Check size={16} /></button>
                                    <button onClick={() => setEditingId(null)} className="text-red-500"><X size={16} /></button>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white select-none">{prompt.title}</h3>
                                    {/* Hover Preview Tooltip (Simple Logic) */}
                                    <div className="absolute top-8 left-0 opacity-0 group-hover:opacity-100 pointer-events-none bg-zinc-900 text-white text-xs px-2 py-1 rounded transition-opacity delay-500 max-w-sm truncate z-10">
                                        {prompt.content || 'Empty prompt content...'}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {expandedId === prompt.id && (
                                <>
                                    <button 
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={(e) => { e.stopPropagation(); startEdit(prompt.id, prompt.title); }}
                                        className="p-2 text-zinc-400 hover:text-violet-600 transition-colors"
                                        title="Rename"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(prompt.content); }}
                                        className="p-2 text-zinc-400 hover:text-green-600 transition-colors"
                                        title="Copy Content"
                                    >
                                        <Copy size={18} />
                                    </button>
                                    <button 
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            deletePrompt(currentProjectId, currentTaskId, prompt.id);
                                        }}
                                        className="p-2 text-zinc-400 hover:text-white hover:bg-red-600 rounded transition-all duration-200 hover:scale-110"
                                        title="Move to Trash"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </>
                            )}
                            <ArrowRight 
                                className={`text-zinc-300 dark:text-zinc-600 transition-transform duration-300 ${expandedId === prompt.id ? 'rotate-90 text-violet-500' : ''}`} 
                                size={20} 
                            />
                        </div>
                    </div>

                    {/* Content Body */}
                    <AnimatePresence>
                        {expandedId === prompt.id && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-zinc-100 dark:border-zinc-800"
                            >
                                <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50">
                                    <textarea 
                                        value={prompt.content}
                                        onChange={(e) => updatePrompt(currentProjectId, currentTaskId, prompt.id, { content: e.target.value })}
                                        placeholder="Enter your prompt here..."
                                        className="w-full min-h-[150px] bg-transparent resize-y outline-none text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono text-sm"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export const PromptList: React.FC = () => {
  const { 
    projects, currentProjectId, currentTaskId, 
    addPrompt, updatePrompt, deletePrompt,
    setViewMode
  } = useStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const currentProject = projects.find(p => p.id === currentProjectId);
  const currentTask = currentProject?.tasks.find(t => t.id === currentTaskId);
  
  // Filter out deleted prompts from the view
  const visiblePrompts = currentTask ? currentTask.prompts.filter(p => !p.deletedAt) : [];

  if (!currentTask) return (
     <div className="flex flex-col items-center justify-center h-full text-zinc-400">
        <p>Select a task to view prompts</p>
     </div>
  );

  const handleAddPrompt = () => {
    if (newPromptTitle.trim()) {
        addPrompt(currentProject!.id, currentTask.id, newPromptTitle.trim(), '');
        setNewPromptTitle('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const startEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const saveEdit = (promptId: string) => {
    if (editTitle.trim()) {
      updatePrompt(currentProject!.id, currentTask.id, promptId, { title: editTitle.trim() });
      setEditingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-zinc-900/50">
        {/* Header / Actions */}
        <div className="p-8 pb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                My Prompts
                <span className="text-sm font-normal text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{visiblePrompts.length}</span>
            </h2>
            <button 
                onClick={() => setViewMode('flow')}
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-violet-500/20"
            >
                <Share2 size={16} /> Prompt Flow
            </button>
        </div>

        {/* New Prompt Input */}
        <div className="px-8 mb-6">
            <div className="relative group">
                <input 
                    type="text"
                    value={newPromptTitle}
                    onChange={(e) => setNewPromptTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPrompt()}
                    placeholder="Type new prompt title..."
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-4 text-zinc-900 dark:text-zinc-100 shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                />
                <button 
                    onClick={handleAddPrompt}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg text-zinc-500 hover:text-violet-600 transition-colors"
                >
                    <Plus size={18} />
                </button>
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar">
            <div className="space-y-4">
                <AnimatePresence mode='popLayout'>
                    {visiblePrompts.map(prompt => (
                        <PromptItem 
                            key={prompt.id}
                            prompt={prompt}
                            expandedId={expandedId}
                            setExpandedId={setExpandedId}
                            editingId={editingId}
                            setEditingId={setEditingId}
                            editTitle={editTitle}
                            setEditTitle={setEditTitle}
                            saveEdit={saveEdit}
                            startEdit={startEdit}
                            copyToClipboard={copyToClipboard}
                            deletePrompt={deletePrompt}
                            currentProjectId={currentProject!.id}
                            currentTaskId={currentTask.id}
                            updatePrompt={updatePrompt}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    </div>
  );
};