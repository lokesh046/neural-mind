import React, { useState, useRef, useEffect } from 'react';

interface VerticalSplitPaneProps {
  children: [React.ReactNode, React.ReactNode];
  minHeight?: number;
  defaultHeight?: number;
}

export default function VerticalSplitPane({ children, minHeight = 120, defaultHeight = 220 }: VerticalSplitPaneProps) {
  const [bottomHeight, setBottomHeight] = useState(defaultHeight);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [activeDrag, setActiveDrag] = useState(false);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setActiveDrag(true);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;

      // Clamp between minHeight and (containerHeight - minHeight)
      if (newHeight >= minHeight && newHeight <= containerRect.height - minHeight) {
        setBottomHeight(newHeight);
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
  }, [minHeight]);

  return (
    <div ref={containerRef} className="flex flex-col flex-1 h-full w-full overflow-hidden relative">
      {activeDrag && (
        <div className="absolute inset-0 z-50 cursor-row-resize bg-transparent" />
      )}
      
      {/* Top Pane (Code Editor) */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {children[0]}
      </div>

      {/* Resizer Handle */}
      <div
        onMouseDown={startResize}
        className="h-1.5 bg-gray-900 hover:bg-emerald-500/50 cursor-row-resize w-full transition-colors duration-150 relative z-30 flex items-center justify-center group"
      >
        <div className="h-[2px] w-12 bg-gray-800 group-hover:bg-emerald-400/80 transition-colors duration-150 rounded-full"></div>
      </div>

      {/* Bottom Pane (Test Cases) */}
      <div
        style={{ height: `${bottomHeight}px` }}
        className="w-full overflow-hidden flex flex-col bg-gray-950"
      >
        {children[1]}
      </div>
    </div>
  );
}
