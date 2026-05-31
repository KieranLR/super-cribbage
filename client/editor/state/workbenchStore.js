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

    getObjectMeta(objectId) {
        return this.state.objectRegistry.find((objectMeta) => objectMeta.id === objectId) || null;
    }

    getDefaultCustomValueByType(type) {
        switch (type) {
            case 'color':
                return '#ffffff';
            case 'boolean':
                return false;
            case 'string':
                return '';
            case 'number':
            default:
                return 0;
        }
    }

    mergeLayoutDefaults(baseLayout, overrideLayout) {
        if (!overrideLayout) {
            return { ...baseLayout };
        }

        return {
            ...baseLayout,
            ...overrideLayout,
            x: {
                ...(baseLayout.x || {}),
                ...((overrideLayout && overrideLayout.x) || {})
            },
            y: {
                ...(baseLayout.y || {}),
                ...((overrideLayout && overrideLayout.y) || {})
            }
        };
    }

    createDefaultObjectConfig(objectMeta) {
        const config = {};

        if (!objectMeta || objectMeta.supportsLayout !== false) {
            const baseLayout = createDefaultObjectLayout();
            const mergedLayout = this.mergeLayoutDefaults(baseLayout, objectMeta?.defaultLayout);
            Object.assign(config, mergedLayout);
        }

        const customProperties = Array.isArray(objectMeta?.customProperties)
            ? objectMeta.customProperties
            : [];

        if (customProperties.length > 0) {
            config.customValues = {};
            customProperties.forEach((property) => {
                if (!property || !property.key) return;
                config.customValues[property.key] = property.defaultValue !== undefined
                    ? property.defaultValue
                    : this.getDefaultCustomValueByType(property.type);
            });
        }

        return config;
    }

    ensureObjectConfigDefaults(existingConfig, objectMeta) {
        const defaults = this.createDefaultObjectConfig(objectMeta);
        const merged = { ...(existingConfig || {}) };

        if (objectMeta?.supportsLayout !== false) {
            Object.keys(defaults).forEach((key) => {
                if (key === 'customValues') {
                    return;
                }
                if (merged[key] === undefined) {
                    merged[key] = JSON.parse(JSON.stringify(defaults[key]));
                }
            });
        }

        if (defaults.customValues) {
            merged.customValues = {
                ...defaults.customValues,
                ...(merged.customValues || {})
            };
        }

        return merged;
    }

    setSelectedObject(objectId) {
        if (objectId && !this.state.layoutConfig.objects[objectId]) {
            const newConfig = { ...this.state.layoutConfig };
            const objectMeta = this.getObjectMeta(objectId);
            const defaultConfig = this.createDefaultObjectConfig(objectMeta);
            newConfig.objects[objectId] = defaultConfig;
            
            // Also store as initial if not present
            const newInitialConfig = { ...this.state.initialLayoutConfig };
            if (!newInitialConfig[objectId]) {
                newInitialConfig[objectId] = JSON.parse(JSON.stringify(defaultConfig));
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
        const objectMeta = this.getObjectMeta(objectId);
        
        if (objectMeta?.supportsLayout !== false) {
            if (this.state.activeBreakpoint === 'desktop') {
                if (initial) {
                    newConfig.objects[objectId] = JSON.parse(JSON.stringify(initial));
                } else {
                    newConfig.objects[objectId] = this.createDefaultObjectConfig(objectMeta);
                }
            } else {
                // For breakpoints, "reset" usually means removing the override
                const baseObject = { ...newConfig.objects[objectId] };
                if (baseObject.breakpoints) {
                    delete baseObject.breakpoints[this.state.activeBreakpoint];
                    newConfig.objects[objectId] = baseObject;
                }
            }
        } else {
            const defaultConfig = this.createDefaultObjectConfig(objectMeta);
            newConfig.objects[objectId] = {
                ...newConfig.objects[objectId],
                customValues: { ...(defaultConfig.customValues || {}) }
            };
        }

        this.setState({ layoutConfig: newConfig });
    }

    patchObjectLayout(objectId, patch) {
        const newConfig = { ...this.state.layoutConfig };
        if (!newConfig.objects) newConfig.objects = {};
        
        const objectMeta = this.getObjectMeta(objectId);
        const baseObject = this.ensureObjectConfigDefaults(newConfig.objects[objectId], objectMeta);
        
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

    patchObjectCustomValues(objectId, patch) {
        if (!objectId || !patch) return;

        const newConfig = { ...this.state.layoutConfig };
        if (!newConfig.objects) newConfig.objects = {};

        const objectMeta = this.getObjectMeta(objectId);
        const baseObject = this.ensureObjectConfigDefaults(newConfig.objects[objectId], objectMeta);
        newConfig.objects[objectId] = {
            ...baseObject,
            customValues: {
                ...(baseObject.customValues || {}),
                ...patch
            }
        };

        this.setState({ layoutConfig: newConfig });
    }

    registerPreviewObjects(objects) {
        const newInitialConfig = { ...this.state.initialLayoutConfig };
        const newLayoutConfig = { ...this.state.layoutConfig };
        if (!newLayoutConfig.objects) newLayoutConfig.objects = {};
        let changed = false;

        objects.forEach(obj => {
            const mergedConfig = this.ensureObjectConfigDefaults(newLayoutConfig.objects[obj.id], obj);

            if (JSON.stringify(newLayoutConfig.objects[obj.id] || {}) !== JSON.stringify(mergedConfig)) {
                newLayoutConfig.objects[obj.id] = mergedConfig;
                changed = true;
            }

            if (!newInitialConfig[obj.id]) {
                // Snapshot current layout/custom defaults as initial
                const current = newLayoutConfig.objects[obj.id] || this.createDefaultObjectConfig(obj);
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
