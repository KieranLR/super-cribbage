import React, { useEffect, useRef, useState } from 'react';
import { createPreviewGame } from './createPreviewGame';
import { workbenchStore, useWorkbenchState } from '../state/workbenchStore';
import { applyWorkbenchLayout } from './applyWorkbenchLayout';
import { inspectableRegistry } from './InspectableRegistry';

const PreviewHost = () => {
    const containerRef = useRef(null);
    const gameControllerRef = useRef(null);
    const dragRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const state = useWorkbenchState();
    const { viewportWidth, viewportHeight, selectedSceneId, layoutConfig, activeBreakpoint } = state;

    useEffect(() => {
        if (containerRef.current && !gameControllerRef.current) {
            gameControllerRef.current = createPreviewGame(containerRef.current, selectedSceneId);
            
            // Sync registry updates back to store
            inspectableRegistry.setUpdateCallback((objects) => {
                workbenchStore.registerPreviewObjects(objects);
            });

            workbenchStore.setPreviewReady(true);
        }

        return () => {
            if (gameControllerRef.current) {
                gameControllerRef.current.destroy();
                gameControllerRef.current = null;
                workbenchStore.setPreviewReady(false);
            }
        };
    }, []);

    // Resize dragging logic
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!dragRef.current) return;
            const { type, startX, startY, startWidth, startHeight } = dragRef.current;
            const dX = e.clientX - startX;
            const dY = e.clientY - startY;

            let newWidth = startWidth;
            let newHeight = startHeight;

            // Since container is centered, any movement of an edge must be doubled in width/height
            // to keep it centered and have the edge follow the mouse.
            if (type.includes('e')) newWidth = startWidth + dX * 2;
            if (type.includes('w')) newWidth = startWidth - dX * 2;
            if (type.includes('s')) newHeight = startHeight + dY * 2;
            if (type.includes('n')) newHeight = startHeight - dY * 2;

            // Clamp values
            newWidth = Math.max(100, Math.round(newWidth));
            newHeight = Math.max(100, Math.round(newHeight));

            workbenchStore.setViewport(newWidth, newHeight);
        };

        const handleMouseUp = () => {
            if (dragRef.current) {
                dragRef.current = null;
                document.body.style.cursor = '';
                setIsDragging(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startResize = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        dragRef.current = {
            type,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: viewportWidth,
            startHeight: viewportHeight
        };
        setIsDragging(true);
        
        // Change cursor globally during drag
        const cursors = {
            n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize',
            ne: 'nesw-resize', nw: 'nwse-resize', se: 'nwse-resize', sw: 'nesw-resize'
        };
        document.body.style.cursor = cursors[type] || '';
    };

    // Apply layout whenever state changes
    useEffect(() => {
        if (gameControllerRef.current) {
            applyWorkbenchLayout(state);
        }
    }, [layoutConfig, activeBreakpoint, viewportWidth, viewportHeight]);

    // Update viewport when store values change
    useEffect(() => {
        if (gameControllerRef.current) {
            gameControllerRef.current.setViewport(viewportWidth, viewportHeight);
        }
    }, [viewportWidth, viewportHeight]);

    // Update scene when selectedSceneId changes
    useEffect(() => {
        if (gameControllerRef.current && selectedSceneId) {
            gameControllerRef.current.setScene(selectedSceneId);
        }
    }, [selectedSceneId]);

    return (
        <div 
            ref={containerRef} 
            className={`bg-black shadow-2xl relative group outline outline-1 transition-colors ${isDragging ? 'outline-blue-500' : 'outline-white/10 hover:outline-blue-500/50'}`} 
            style={{ 
                width: `${viewportWidth}px`, 
                height: `${viewportHeight}px`,
            }}
        >
            {/* Phaser mounts here */}

            {/* Resize Handles - Visual clear indicators */}
            <div className={`absolute inset-0 pointer-events-none border transition-colors ${isDragging ? 'border-blue-500/50' : 'border-blue-500/0 group-hover:border-blue-500/30'}`} />
            
            {/* Edge Handles */}
            <div className={`absolute -top-1.5 left-4 right-4 h-3 cursor-ns-resize z-20 rounded transition-colors ${isDragging ? 'bg-blue-500/10' : 'hover:bg-blue-500/20'}`} onMouseDown={(e) => startResize(e, 'n')} />
            <div className={`absolute -bottom-1.5 left-4 right-4 h-3 cursor-ns-resize z-20 rounded transition-colors ${isDragging ? 'bg-blue-500/10' : 'hover:bg-blue-500/20'}`} onMouseDown={(e) => startResize(e, 's')} />
            <div className={`absolute top-4 -right-1.5 bottom-4 w-3 cursor-ew-resize z-20 rounded transition-colors ${isDragging ? 'bg-blue-500/10' : 'hover:bg-blue-500/20'}`} onMouseDown={(e) => startResize(e, 'e')} />
            <div className={`absolute top-4 -left-1.5 bottom-4 w-3 cursor-ew-resize z-20 rounded transition-colors ${isDragging ? 'bg-blue-500/10' : 'hover:bg-blue-500/20'}`} onMouseDown={(e) => startResize(e, 'w')} />
            
            {/* Corner Handles */}
            <div className={`absolute -top-1 -left-1 w-4 h-4 cursor-nwse-resize z-30 border-2 border-white rounded-full transition-all shadow-lg ${isDragging ? 'bg-blue-500 scale-100' : 'group-hover:bg-blue-500 scale-0 group-hover:scale-100'}`} onMouseDown={(e) => startResize(e, 'nw')} />
            <div className={`absolute -top-1 -right-1 w-4 h-4 cursor-nesw-resize z-30 border-2 border-white rounded-full transition-all shadow-lg ${isDragging ? 'bg-blue-500 scale-100' : 'group-hover:bg-blue-500 scale-0 group-hover:scale-100'}`} onMouseDown={(e) => startResize(e, 'ne')} />
            <div className={`absolute -bottom-1 -left-1 w-4 h-4 cursor-nesw-resize z-30 border-2 border-white rounded-full transition-all shadow-lg ${isDragging ? 'bg-blue-500 scale-100' : 'group-hover:bg-blue-500 scale-0 group-hover:scale-100'}`} onMouseDown={(e) => startResize(e, 'sw')} />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 cursor-nwse-resize z-30 border-2 border-white rounded-full transition-all shadow-lg ${isDragging ? 'bg-blue-500 scale-100' : 'group-hover:bg-blue-500 scale-0 group-hover:scale-100'}`} onMouseDown={(e) => startResize(e, 'se')} />
        </div>
    );
};

export default PreviewHost;
