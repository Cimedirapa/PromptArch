import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';

interface BouncingItem {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  width: number;
  height: number;
  color: string;
  name: string;
  animal: string;
}

const ANIMALS = ['🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🐙', '🦄', '🦉', '🦋'];
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

export const BeProud: React.FC = () => {
  const { toggleBeProud, projects } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<BouncingItem[]>([]);
  const requestRef = useRef<number>(0);

  // Initialize items
  useEffect(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    
    const activeProjects = projects.filter(p => !p.deletedAt);
    
    const initialItems = activeProjects.map((p, i) => ({
      id: p.id,
      x: Math.random() * (clientWidth - 200),
      y: Math.random() * (clientHeight - 200),
      dx: (Math.random() > 0.5 ? 2 : -2),
      dy: (Math.random() > 0.5 ? 2 : -2),
      width: 200, // Adjusted approximation for larger emoji
      height: 200,
      color: COLORS[i % COLORS.length],
      name: p.name,
      animal: ANIMALS[i % ANIMALS.length]
    }));
    
    setItems(initialItems);
  }, [projects]);

  // Animation Loop
  const animate = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;

    setItems(prevItems => prevItems.map(item => {
      let { x, y, dx, dy } = item;
      
      x += dx;
      y += dy;

      // Bounce Logic
      if (x <= 0 || x + item.width >= clientWidth) {
        dx = -dx;
        x = x <= 0 ? 0 : clientWidth - item.width;
      }
      if (y <= 0 || y + item.height >= clientHeight) {
        dy = -dy;
        y = y <= 0 ? 0 : clientHeight - item.height;
      }

      return { ...item, x, y, dx, dy };
    }));

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);

  return (
    <div 
        ref={containerRef}
        onClick={() => toggleBeProud(false)}
        className="fixed inset-0 z-50 overflow-hidden cursor-pointer bg-white dark:bg-black transition-colors duration-300"
    >
        {items.map(item => (
            <div
                key={item.id}
                style={{
                    transform: `translate(${item.x}px, ${item.y}px)`,
                }}
                className="absolute flex flex-col items-center justify-center pointer-events-none"
            >
                <span className="text-8xl leading-none filter drop-shadow-lg">{item.animal}</span>
                <span 
                    className="text-lg font-bold mt-2 tracking-wide uppercase shadow-black" 
                    style={{ color: item.color }}
                >
                    {item.name}
                </span>
            </div>
        ))}
        
        {/* Centered Exit Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest text-zinc-100 dark:text-zinc-900 select-none">
                Be Proud
            </h1>
            <p className="mt-4 text-xl text-zinc-300 dark:text-zinc-800 uppercase tracking-widest animate-pulse">
                Touch anywhere to exit
            </p>
        </div>
    </div>
  );
};