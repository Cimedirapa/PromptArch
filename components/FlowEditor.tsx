import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  useReactFlow
} from 'reactflow';
import { useStore } from '../store';
import { ArrowLeft } from 'lucide-react';

const AxesNode = () => (
    <div className="relative w-0 h-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[2000px] h-[2px] bg-violet-500/50" />
        <div className="absolute h-[2000px] w-[2px] bg-violet-500/50" />
        <div className="absolute w-2 h-2 rounded-full bg-violet-600" />
    </div>
);

const nodeTypes = {
  axes: AxesNode,
};

const initialNodes: Node[] = [
    {
        id: 'axes',
        type: 'axes',
        position: { x: 0, y: 0 },
        data: { label: 'Origin' },
        draggable: false,
        selectable: false,
        zIndex: -1
    }
];
const initialEdges: Edge[] = [];

export const FlowEditor: React.FC = () => {
  const { 
    projects, currentProjectId, currentTaskId, setViewMode,
  } = useStore();
  const { screenToFlowPosition } = useReactFlow();

  const currentProject = projects.find(p => p.id === currentProjectId);
  const currentTask = currentProject?.tasks.find(t => t.id === currentTaskId);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Drag and Drop Logic
  const onDragStart = (event: React.DragEvent, nodeType: string, promptContent: string, promptTitle: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('content', promptContent);
    event.dataTransfer.setData('title', promptTitle);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const content = event.dataTransfer.getData('content');
      const title = event.dataTransfer.getData('title');

      if (typeof type === 'undefined' || !type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Default dimensions for the new node to center it
      const nodeWidth = 200;
      // height varies but we estimate or just center horizontally and offset vertically a bit
      
      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: 'default',
        // Center the node on the mouse position (approximate height offset)
        position: { x: position.x - nodeWidth / 2, y: position.y - 20 },
        data: { label: title },
        style: { 
            background: '#fff', 
            border: '1px solid #7c3aed', 
            borderRadius: '8px', 
            padding: '10px', 
            width: nodeWidth,
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, screenToFlowPosition]
  );

  return (
    <div className="w-full h-full flex bg-zinc-50 dark:bg-zinc-950">
        {/* Sidebar for Prompts */}
        <div className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-4 flex flex-col z-10 shadow-xl">
             <button 
                onClick={() => setViewMode('list')}
                className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
                <ArrowLeft size={16} /> Back to List
            </button>
            <h3 className="font-bold text-violet-600 mb-4 uppercase text-xs tracking-wider">Available Prompts</h3>
            <p className="text-xs text-zinc-400 mb-4">Drag prompts to the canvas.</p>
            
            <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
                {currentTask?.prompts.map(prompt => (
                    <div 
                        key={prompt.id}
                        onDragStart={(event) => onDragStart(event, 'default', prompt.content, prompt.title)}
                        draggable
                        className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded cursor-grab active:cursor-grabbing hover:border-violet-400 transition-colors text-sm text-zinc-700 dark:text-zinc-200"
                    >
                        {prompt.title}
                    </div>
                ))}
            </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 h-full" onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                snapToGrid
            >
                <Background color="#ddd" gap={16} />
                <Controls />
                <MiniMap style={{ background: 'transparent' }} nodeColor={'#7c3aed'} />
                <Panel position="top-right" className="bg-white/80 dark:bg-black/50 p-2 rounded text-xs text-zinc-500">
                    Shift + Scroll to Zoom
                </Panel>
            </ReactFlow>
        </div>
    </div>
  );
};