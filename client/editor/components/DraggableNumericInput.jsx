import React, { useState, useEffect, useRef } from 'react';

/**
 * A numeric input where dragging the label adjusts the value.
 * Supports Shift+Drag for faster adjustments and Alt+Drag for finer adjustments.
 */
const DraggableNumericInput = ({ label, value, onChange, step = 1, className = "" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startValue = useRef(0);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX.current;
      
      // Multipliers: Shift = 10x, Alt = 0.1x
      let multiplier = 1;
      if (e.shiftKey) multiplier = 10;
      if (e.altKey) multiplier = 0.1;
      
      const newValue = startValue.current + (deltaX * step * multiplier);
      
      // Formatting based on step size
      let finalValue;
      if (step < 0.1) {
        finalValue = Math.round(newValue * 1000) / 1000;
      } else if (step < 1) {
        finalValue = Math.round(newValue * 100) / 100;
      } else {
        finalValue = Math.round(newValue);
      }
      
      onChange(finalValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onChange, step]);

  const onMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    startX.current = e.clientX;
    startValue.current = value || 0;
    document.body.style.cursor = 'ew-resize';
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label 
        onMouseDown={onMouseDown}
        className="text-[10px] uppercase text-gray-500 font-bold cursor-ew-resize select-none hover:text-blue-400 transition-colors flex justify-between items-center"
        title="Drag to adjust, Shift for 10x, Alt for 0.1x"
      >
        <span>{label}</span>
      </label>
      <input 
        type="number" 
        step={step}
        value={value ?? 0}
        onChange={(e) => {
            const val = parseFloat(e.target.value);
            onChange(isNaN(val) ? 0 : val);
        }}
        className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-xs outline-none focus:ring-1 focus:ring-blue-500 transition-all"
      />
    </div>
  );
};

export default DraggableNumericInput;
