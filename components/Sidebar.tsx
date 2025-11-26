import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Reorder, AnimatePresence, useDragControls, motion } from 'framer-motion';
import { Trash2, Edit2, Settings, Moon, Sun, Check, X, Box, Lightbulb, GripVertical } from 'lucide-react';
import { LANGUAGES, TIPS, Project } from '../types';

interface ProjectItemProps {
    project: Project;
    currentProjectId: string | null;
    setCurrentProject: (id: string | null) => void;
    startEdit: (id: string, name: string) => void;
    deleteProject: (id: string) => void;
    editingId: string | null;
    editName: string;
    setEditName: (name: string) => void;
    saveEdit: () => void;
    setEditingId: (id: string | null) => void;
}

const ProjectItem: React.FC<ProjectItemProps> = ({ 
    project, 
    currentProjectId, 
    setCurrentProject, 
    startEdit, 
    deleteProject, 
    editingId, 
    editName, 
    setEditName, 
    saveEdit,
    setEditingId
}) => {
    const controls = useDragControls();

    return (
        <Reorder.Item 
            value={project}
            dragListener={false}
            dragControls={controls}
            className="relative group touch-none"
        >
            <div 
                className={`relative p-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                    currentProjectId === project.id 
                    ? 'bg-zinc-100 dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-white' 
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400'
                }`}
                onClick={() => setCurrentProject(project.id)}
            >
                {/* Drag Handle */}
                <div 
                    className="p-1 text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 cursor-grab active:cursor-grabbing"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <GripVertical size={14} />
                </div>

                <div className="flex-1 overflow-hidden">
                    {editingId === project.id ? (
                        <div className="flex items-center gap-2">
                        <input 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-transparent border-b border-violet-500 text-sm focus:outline-none dark:text-white"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button 
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); saveEdit(); }} 
                            className="text-green-600"
                        >
                            <Check size={14} />
                        </button>
                        <button 
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); setEditingId(null); }} 
                            className="text-red-500"
                        >
                            <X size={14} />
                        </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate select-none">{project.name}</span>
                        
                        {/* Hover Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => { e.stopPropagation(); startEdit(project.id, project.name); }}
                                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-violet-600 transition-colors"
                            >
                                <Edit2 size={12} />
                            </button>
                            <button 
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    deleteProject(project.id); 
                                }}
                                className="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-110"
                                title="Move to trash"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                        </div>
                    )}
                </div>
            </div>
        </Reorder.Item>
    );
};

export const Sidebar: React.FC = () => {
  const { 
    projects, currentProjectId, setCurrentProject, 
    addProject, deleteProject, updateProjectName, reorderProjects,
    settings, setLanguage, setTheme, toggleTrash,
    ui, toggleBeProud, setViewMode
  } = useStore();
  
  const [newProjectName, setNewProjectName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const activeProjects = projects.filter(p => !p.deletedAt);
  const currentTips = TIPS[settings.language];

  // Rotate Tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
        setCurrentTipIndex(prev => (prev + 1) % currentTips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [currentTips.length]);

  const handleAddProject = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newProjectName.trim()) {
      addProject(newProjectName.trim());
      setNewProjectName('');
    }
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      updateProjectName(editingId, editName.trim());
      setEditingId(null);
    }
  };

  const handleHomeClick = () => {
      setCurrentProject(null);
      if (ui.isTrashOpen) toggleTrash();
      toggleBeProud(false);
      setViewMode('list');
  };

  return (
    <div className="w-64 h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-colors duration-300 flex-shrink-0">
      {/* Logo */}
      <div 
        className="p-6 cursor-pointer hover:opacity-80 transition-opacity" 
        onClick={handleHomeClick}
        title="Go to Home"
      >
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Box className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">PromptArch</h1>
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        {/* New Project Input */}
        <div className="mb-6">
            <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={handleAddProject}
                placeholder="New Project..."
                className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-800 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-violet-600 transition-all"
            />
        </div>

        <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mb-2 uppercase tracking-wider pl-1">Projects</div>
        
        <Reorder.Group axis="y" values={activeProjects} onReorder={reorderProjects} className="space-y-1">
          <AnimatePresence initial={false}>
            {activeProjects.map(project => (
              <ProjectItem 
                key={project.id}
                project={project}
                currentProjectId={currentProjectId}
                setCurrentProject={setCurrentProject}
                startEdit={startEdit}
                deleteProject={deleteProject}
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

      {/* Bottom Section */}
      <div className="p-4 space-y-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 z-10">
        
        {/* Rotating Tips Box */}
        <div className="bg-violet-50 dark:bg-violet-900/10 p-4 rounded-xl border border-violet-100 dark:border-violet-900/30">
            <div className="flex items-center gap-2 mb-2 text-violet-700 dark:text-violet-300">
                <Lightbulb size={12} />
                <h3 className="text-xs font-bold uppercase">Tip</h3>
            </div>
            <div className="h-12 flex items-center">
                <AnimatePresence mode='wait'>
                    <motion.div 
                        key={currentTipIndex}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-xs text-violet-600 dark:text-violet-400 leading-snug"
                    >
                       {currentTips[currentTipIndex]}
                    </motion.div>
                </AnimatePresence>
            </div>
            {/* Dots indicator */}
            <div className="flex gap-1 mt-2 justify-center">
                {currentTips.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1 rounded-full transition-all duration-300 ${i === currentTipIndex ? 'w-3 bg-violet-500' : 'w-1 bg-violet-200 dark:bg-violet-800'}`}
                    />
                ))}
            </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-2 pt-2">
            <button 
                onClick={toggleTrash}
                onPointerDown={(e) => e.stopPropagation()}
                className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors flex items-center gap-2 text-xs font-medium"
            >
                <Trash2 size={16} /> Trash
            </button>
            
            <div className="relative">
                <button 
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                    <Settings size={18} />
                </button>
                
                {/* Settings Popup */}
                {settingsOpen && (
                    <>
                    <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 p-3 z-50">
                        <div className="mb-3">
                            <label className="text-xs text-zinc-500 block mb-1">Theme</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setTheme('light')}
                                    className={`flex-1 p-1 rounded flex items-center justify-center border ${settings.theme === 'light' ? 'bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-600' : 'border-transparent'}`}
                                >
                                    <Sun size={14} />
                                </button>
                                <button 
                                    onClick={() => setTheme('dark')}
                                    className={`flex-1 p-1 rounded flex items-center justify-center border ${settings.theme === 'dark' ? 'bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-600' : 'border-transparent'}`}
                                >
                                    <Moon size={14} />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 block mb-1">Language</label>
                            <select 
                                value={settings.language} 
                                onChange={(e) => setLanguage(e.target.value as any)}
                                className="w-full text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-1 dark:text-white focus:outline-none focus:border-violet-500"
                            >
                                {Object.keys(LANGUAGES).map(lang => (
                                    <option key={lang} value={lang}>{LANGUAGES[lang as keyof typeof LANGUAGES]}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};