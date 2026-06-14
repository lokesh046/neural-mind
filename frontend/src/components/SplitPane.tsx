import React, { useState, useRef, useEffect } from 'react';

interface SplitPaneProps {
  children: [React.ReactNode, React.ReactNode];
  minWidth?: number;
  defaultWidth?: number;
}

export default function SplitPane({ children, minWidth = 350, defaultWidth = 580 }: SplitPaneProps) {
  const [leftWidth, setLeftWidth] = useState(defaultWidth);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [activeDrag, setActiveDrag] = useState(false);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setActiveDrag(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      
      // Clamp between minWidth and (containerWidth - minWidth)
      if (newWidth >= minWidth && newWidth <= containerRect.width - minWidth) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setActiveDrag(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [minWidth]);

  return (
    <div ref={containerRef} className="flex flex-1 h-full w-full overflow-hidden relative">
      {activeDrag && (
        <div className="absolute inset-0 z-50 cursor-col-resize bg-transparent" />
      )}
      
      {/* Left Pane */}
      <div 
        style={{ width: `${leftWidth}px`, minWidth: `${minWidth}px`, flexShrink: 0 }} 
        className="h-full overflow-hidden flex flex-col bg-gray-950"
      >
        {children[0]}
      </div>
      
      {/* Resizer Handle */}
      <div
        onMouseDown={startResize}
        className="w-1.5 bg-gray-900 hover:bg-emerald-500/50 cursor-col-resize h-full transition-colors duration-150 relative z-30 flex items-center justify-center group split-pane-resizer"
      >
        <div className="w-[1.5px] h-8 bg-gray-800 group-hover:bg-emerald-400/80 transition-colors duration-150 rounded-full"></div>
      </div>
      
      {/* Right Pane */}
      <div className="flex-1 h-full overflow-hidden flex flex-col bg-gray-950">
        {children[1]}
      </div>
    </div>
  );
}

