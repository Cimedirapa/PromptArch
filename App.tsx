import React from 'react';
import { StoreProvider, useStore } from './store';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { PromptList } from './components/PromptList';
import { FlowEditor } from './components/FlowEditor';
import { TrashModal } from './components/TrashModal';
import { BeProud } from './components/BeProud';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { ReactFlowProvider } from 'reactflow';

const AppContent: React.FC = () => {
  const { ui, currentProjectId, currentTaskId, toggleBeProud, setViewMode } = useStore();

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-white dark:bg-black text-zinc-900 dark:text-white font-sans selection:bg-violet-200 dark:selection:bg-violet-900">
      
      {/* Screensaver Overlay */}
      {ui.isBeProudOpen && <BeProud />}
      
      {/* Trash Overlay */}
      <TrashModal />

      {/* Main Layout */}
      <Sidebar />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Navigation / Top Bar */}
        <div className="flex items-center bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
            {/* Nav Back Logic (Visual only as per req, resets to specific state if deep) */}
             {ui.viewMode === 'flow' && (
                <button 
                    onClick={() => setViewMode('list')}
                    className="h-16 px-4 flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white border-r border-zinc-200 dark:border-zinc-800 transition-colors flex-shrink-0"
                >
                    <ArrowLeft size={20} />
                </button>
             )}
            
            <div className="flex-1 overflow-hidden min-w-0">
                <Topbar />
            </div>

            {/* Be Proud Button */}
             <button 
                onClick={() => toggleBeProud(true)}
                className="h-16 px-6 flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-violet-600 transition-colors border-l border-zinc-200 dark:border-zinc-800 whitespace-nowrap flex-shrink-0"
            >
                <Sparkles size={16} /> Be Proud
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
            {!currentProjectId ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
                    <Sparkles size={48} className="mb-4 opacity-20" />
                    <p>Select or create a project to begin.</p>
                </div>
            ) : !currentTaskId ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
                    <p>Select a task from the top bar.</p>
                </div>
            ) : (
                ui.viewMode === 'list' ? <PromptList /> : (
                    <ReactFlowProvider>
                        <FlowEditor />
                    </ReactFlowProvider>
                )
            )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;