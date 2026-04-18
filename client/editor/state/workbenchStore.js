/**
 * Central store for Editor state.
 * Using a simple observer pattern to keep it independent from React.
 */

import { createDefaultObjectLayout } from '../../shared/layout/layoutSchema';

class WorkbenchStore {
    constructor() {
        this.state = {
            selectedSceneId: null,
            selectedObjectId: null,
            viewportWidth: 1280,
            viewportHeight: 720,
            activeBreakpoint: 'desktop',
            layoutConfig: {
                objects: {}
            },
            initialLayoutConfig: {}, // Snapshot of when objects were first seen/loaded
            objectRegistry: [],
            availableScenes: [],
            previewReady: false
        };
        this.listeners = new Set();
    }

    getState() {
        return this.state;
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    setState(patch) {
        this.state = { ...this.state, ...patch };
        this.notify();
    }

    // Actions
    setSelectedScene(sceneId) {
        this.setState({ selectedSceneId: sceneId, selectedObjectId: null });
    }

    setSelectedObject(objectId) {
        if (objectId && !this.state.layoutConfig.objects[objectId]) {
            const newConfig = { ...this.state.layoutConfig };
            const defaultLayout = createDefaultObjectLayout();
            newConfig.objects[objectId] = defaultLayout;
            
            // Also store as initial if not present
            const newInitialConfig = { ...this.state.initialLayoutConfig };
            if (!newInitialConfig[objectId]) {
                newInitialConfig[objectId] = JSON.parse(JSON.stringify(defaultLayout));
            }

            this.setState({ 
                layoutConfig: newConfig, 
                selectedObjectId: objectId,
                initialLayoutConfig: newInitialConfig
            });
        } else {
            this.setState({ selectedObjectId: objectId });
        }
    }

    setViewport(width, height) {
        this.setState({ viewportWidth: width, viewportHeight: height });
    }

    setActiveBreakpoint(breakpoint) {
        this.setState({ activeBreakpoint: breakpoint });
    }

    replaceLayoutConfig(config) {
        this.setState({ 
            layoutConfig: config,
            initialLayoutConfig: JSON.parse(JSON.stringify(config.objects || {}))
        });
    }

    resetObjectLayout(objectId) {
        if (!objectId) return;

        const newConfig = { ...this.state.layoutConfig };
        const initial = this.state.initialLayoutConfig[objectId];
        
        if (this.state.activeBreakpoint === 'desktop') {
            if (initial) {
                newConfig.objects[objectId] = JSON.parse(JSON.stringify(initial));
            } else {
                newConfig.objects[objectId] = createDefaultObjectLayout();
            }
        } else {
            // For breakpoints, "reset" usually means removing the override
            const baseObject = { ...newConfig.objects[objectId] };
            if (baseObject.breakpoints) {
                delete baseObject.breakpoints[this.state.activeBreakpoint];
                newConfig.objects[objectId] = baseObject;
            }
        }

        this.setState({ layoutConfig: newConfig });
    }

    patchObjectLayout(objectId, patch) {
        const newConfig = { ...this.state.layoutConfig };
        if (!newConfig.objects) newConfig.objects = {};
        
        const baseObject = newConfig.objects[objectId] || {};
        
        if (this.state.activeBreakpoint === 'desktop') {
            newConfig.objects[objectId] = { ...baseObject, ...patch };
        } else {
            if (!baseObject.breakpoints) baseObject.breakpoints = {};
            baseObject.breakpoints[this.state.activeBreakpoint] = {
                ...(baseObject.breakpoints[this.state.activeBreakpoint] || {}),
                ...patch
            };
            newConfig.objects[objectId] = { ...baseObject };
        }
        
        this.setState({ layoutConfig: newConfig });
    }

    registerPreviewObjects(objects) {
        const newInitialConfig = { ...this.state.initialLayoutConfig };
        const newLayoutConfig = { ...this.state.layoutConfig };
        if (!newLayoutConfig.objects) newLayoutConfig.objects = {};
        let changed = false;

        objects.forEach(obj => {
            if (!newInitialConfig[obj.id]) {
                // Snapshot current layout or default as initial
                const current = newLayoutConfig.objects[obj.id] || createDefaultObjectLayout();
                newInitialConfig[obj.id] = JSON.parse(JSON.stringify(current));
                
                // Also ensure it's in layoutConfig if missing
                if (!newLayoutConfig.objects[obj.id]) {
                    newLayoutConfig.objects[obj.id] = JSON.parse(JSON.stringify(current));
                }
                changed = true;
            }
        });

        if (changed) {
            this.setState({ 
                objectRegistry: objects, 
                initialLayoutConfig: newInitialConfig,
                layoutConfig: newLayoutConfig
            });
        } else {
            this.setState({ objectRegistry: objects });
        }
    }

    setPreviewReady(ready) {
        this.setState({ previewReady: ready });
    }

    setAvailableScenes(scenes) {
        this.setState({ availableScenes: scenes });
    }
}

export const workbenchStore = new WorkbenchStore();

// React Hook for using the store
import { useState, useEffect } from 'react';

export function useWorkbenchState() {
    const [state, setState] = useState(workbenchStore.getState());

    useEffect(() => {
        return workbenchStore.subscribe(newFullState => {
            setState(newFullState);
        });
    }, []);

    return state;
}
