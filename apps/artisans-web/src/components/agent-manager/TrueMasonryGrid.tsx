
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface TrueMasonryGridProps {
  children: React.ReactElement[];
  className?: string;
  columnWidth?: number;
  gap?: number;
}

export const TrueMasonryGrid: React.FC<TrueMasonryGridProps> = ({
  children,
  className = '',
  columnWidth = 400,
  gap = 20
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(1);
  const [heights, setHeights] = useState<number[]>([]);
  const itemHeights = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    const updateLayout = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const newColumns = Math.max(1, Math.floor((containerWidth + gap) / (columnWidth + gap)));
      
      if (newColumns !== columns) {
        setColumns(newColumns);
        setHeights(new Array(newColumns).fill(0));
        itemHeights.current.clear();
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [columnWidth, gap, columns]);

  const updateItemHeight = useCallback((index: number, height: number) => {
    const currentHeight = itemHeights.current.get(index);
    if (currentHeight !== height && height > 0) {
      itemHeights.current.set(index, height);
      
      // Recalculate all heights
      const newHeights = new Array(columns).fill(0);
      const itemPositions: { columnIndex: number; top: number }[] = [];
      
      for (let i = 0; i < children.length; i++) {
        const itemHeight = itemHeights.current.get(i);
        if (itemHeight) {
          const columnIndex = newHeights.indexOf(Math.min(...newHeights));
          itemPositions[i] = { columnIndex, top: newHeights[columnIndex] };
          newHeights[columnIndex] += itemHeight + gap;
        }
      }
      
      setHeights(newHeights);
    }
  }, [columns, children.length, gap]);

  const getItemStyle = (index: number) => {
    if (heights.length === 0) return {};

    const itemHeight = itemHeights.current.get(index);
    if (!itemHeight) return {};

    // Calculate position based on current heights
    const newHeights = [...heights];
    for (let i = 0; i < index; i++) {
      const prevHeight = itemHeights.current.get(i);
      if (prevHeight) {
        const columnIndex = newHeights.indexOf(Math.min(...newHeights));
        newHeights[columnIndex] += prevHeight + gap;
      }
    }

    const columnIndex = newHeights.indexOf(Math.min(...newHeights));
    const left = columnIndex * (columnWidth + gap);
    const top = newHeights[columnIndex];

    return {
      position: 'absolute' as const,
      left: `${left}px`,
      top: `${top}px`,
      width: `${columnWidth}px`,
      transition: 'all 0.3s ease'
    };
  };

  const containerHeight = heights.length > 0 ? Math.max(...heights) : 0;

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        height: `${containerHeight}px`,
        transition: 'height 0.3s ease'
      }}
    >
      {children.map((child, index) => (
        <div
          key={child.key || index}
          style={getItemStyle(index)}
          ref={(el) => {
            if (el && el.offsetHeight > 0) {
              updateItemHeight(index, el.offsetHeight);
            }
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};
