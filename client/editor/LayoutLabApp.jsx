import React from 'react';
import { useWorkbenchState, workbenchStore } from './state/workbenchStore';
import PreviewHost from './preview/PreviewHost';
import { PREVIEW_SCENES } from './preview/previewScenes';
import { ANCHORS, VALUE_MODES } from '../shared/layout/layoutSchema';
import DraggableNumericInput from './components/DraggableNumericInput';

const LayoutLabApp = () => {
  const state = useWorkbenchState();
  const { 
    selectedSceneId, 
    selectedObjectId, 
    viewportWidth, 
    viewportHeight, 
    activeBreakpoint,
    objectRegistry,
    layoutConfig
  } = state;

  const selectedObject = objectRegistry.find(o => o.id === selectedObjectId);
  const selectedObjectLayout = selectedObjectId ? (layoutConfig.objects[selectedObjectId] || {}) : null;

  const handlePatch = (patch) => {
    workbenchStore.patchObjectLayout(selectedObjectId, patch);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-900 text-gray-100 font-sans">
      {/* Sidebar / Left Panel */}
      <div 
        className="flex flex-col border-r border-gray-700 h-full overflow-hidden shrink-0"
        style={{ width: '350px' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
          <h1 className="font-bold text-lg uppercase tracking-wider text-blue-400">Layout Lab</h1>
          <div className="text-xs bg-gray-700 px-2 py-1 rounded">v0.1.0</div>
        </div>

        {/* Toolbar (Scene, Breakpoint) */}
        <div className="p-2 border-b border-gray-700 flex flex-col gap-2">
           <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-semibold px-1">Scene</label>
              <select 
                value={selectedSceneId || ''} 
                onChange={(e) => workbenchStore.setSelectedScene(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded p-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select a scene...</option>
                {PREVIEW_SCENES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
           </div>
           <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 font-semibold px-1">Breakpoint</label>
              <div className="flex bg-gray-800 rounded p-1 border border-gray-700">
                {['desktop', 'tablet', 'mobile'].map(bp => (
                  <button 
                    key={bp} 
                    onClick={() => workbenchStore.setActiveBreakpoint(bp)}
                    className={`flex-1 text-xs py-1 rounded capitalize ${bp === activeBreakpoint ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}
                  >
                    {bp}
                  </button>
                ))}
              </div>
           </div>
        </div>

        {/* Object Tree / Inspector Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3">Objects</h2>
            <div className="space-y-1">
              {objectRegistry.map(obj => (
                <div 
                  key={obj.id}
                  onClick={() => workbenchStore.setSelectedObject(obj.id)}
                  className={`p-2 rounded text-sm flex justify-between items-center cursor-pointer ${obj.id === selectedObjectId ? 'bg-blue-900/50 border border-blue-500/50' : 'hover:bg-gray-800 text-gray-400'}`}
                >
                  <span>{obj.label}</span>
                  <span className="text-[10px] opacity-50 uppercase">{obj.type}</span>
                </div>
              ))}
              {objectRegistry.length === 0 && (
                <p className="text-xs text-gray-600 italic">No inspectable objects registered.</p>
              )}
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xs text-gray-400 uppercase tracking-widest font-bold">Inspector</h2>
                {selectedObjectId && (
                  <button 
                    onClick={() => workbenchStore.resetObjectLayout(selectedObjectId)}
                    className="text-[10px] bg-red-900/30 hover:bg-red-900/50 text-red-400 px-2 py-0.5 rounded border border-red-800/50 transition-colors uppercase font-bold"
                    title="Reset to initial values (desktop) or remove override (breakpoint)"
                  >
                    Reset
                  </button>
                )}
              </div>
              {selectedObjectId ? (
                <div className="space-y-4 text-sm bg-gray-800/50 p-3 rounded border border-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-500 font-bold">Anchor</label>
                        <select 
                          value={selectedObjectLayout?.anchor || 'center'}
                          onChange={(e) => handlePatch({ anchor: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-xs"
                        >
                          {Object.values(ANCHORS).map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-500 font-bold">X Mode</label>
                        <select 
                          value={selectedObjectLayout?.x?.mode || 'percent'}
                          onChange={(e) => handlePatch({ x: { ...selectedObjectLayout.x, mode: e.target.value } })}
                          className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-xs"
                        >
                          <option value="percent">Percent</option>
                          <option value="px">Pixels</option>
                        </select>
                     </div>
                     <DraggableNumericInput 
                        label="X Value"
                        step={selectedObjectLayout?.x?.mode === 'percent' ? 0.01 : 1}
                        value={selectedObjectLayout?.x?.value ?? 0}
                        onChange={(val) => handlePatch({ x: { ...selectedObjectLayout.x, value: val } })}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-500 font-bold">Y Mode</label>
                        <select 
                          value={selectedObjectLayout?.y?.mode || 'percent'}
                          onChange={(e) => handlePatch({ y: { ...selectedObjectLayout.y, mode: e.target.value } })}
                          className="w-full bg-gray-900 border border-gray-700 rounded p-1 text-xs"
                        >
                          <option value="percent">Percent</option>
                          <option value="px">Pixels</option>
                        </select>
                     </div>
                     <DraggableNumericInput 
                        label="Y Value"
                        step={selectedObjectLayout?.y?.mode === 'percent' ? 0.01 : 1}
                        value={selectedObjectLayout?.y?.value ?? 0}
                        onChange={(val) => handlePatch({ y: { ...selectedObjectLayout.y, value: val } })}
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <DraggableNumericInput 
                      label="Offset X"
                      value={selectedObjectLayout?.offsetX ?? 0}
                      onChange={(val) => handlePatch({ offsetX: val })}
                    />
                    <DraggableNumericInput 
                      label="Offset Y"
                      value={selectedObjectLayout?.offsetY ?? 0}
                      onChange={(val) => handlePatch({ offsetY: val })}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="visible-toggle"
                          checked={selectedObjectLayout?.visible !== false}
                          onChange={(e) => handlePatch({ visible: e.target.checked })}
                          className="cursor-pointer"
                        />
                        <label htmlFor="visible-toggle" className="text-[10px] uppercase text-gray-500 font-bold cursor-pointer">Visible</label>
                     </div>
                     <DraggableNumericInput 
                        className="flex-1"
                        label="Scale"
                        step={0.1}
                        value={selectedObjectLayout?.scale ?? 1}
                        onChange={(val) => handlePatch({ scale: val })}
                     />
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic text-xs bg-gray-800/50 p-3 rounded border border-gray-700">Select an object to edit...</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-700 bg-gray-800 flex gap-2">
          <button 
            onClick={() => {
                const json = JSON.stringify(layoutConfig, null, 2);
                navigator.clipboard.writeText(json);
                alert('Layout JSON copied to clipboard!');
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-bold shadow-lg transition-colors"
          >
            Copy JSON
          </button>
        </div>
      </div>

      {/* Main / Preview Panel */}
      <div className="flex-1 flex flex-col bg-gray-800 h-full">
        {/* Preview Toolbar */}
        <div className="p-2 bg-gray-900/50 border-b border-gray-700 flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => workbenchStore.setViewport(1280, 720)}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs"
            >
              1280x720
            </button>
            <button 
              onClick={() => workbenchStore.setViewport(390, 844)}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs"
            >
              390x844
            </button>
            <div className="h-4 w-[1px] bg-gray-700 mx-1"></div>
            <input 
                type="number" 
                className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 w-16 text-center text-xs" 
                value={viewportWidth} 
                onChange={(e) => workbenchStore.setViewport(parseInt(e.target.value) || 0, viewportHeight)}
            />
            <span className="text-gray-600">x</span>
            <input 
                type="number" 
                className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 w-16 text-center text-xs" 
                value={viewportHeight} 
                onChange={(e) => workbenchStore.setViewport(viewportWidth, parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="text-xs text-gray-500 italic font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Drag edges to resize
          </div>
        </div>

        {/* Phaser Container */}
        <div className="flex-1 overflow-auto p-8 flex justify-center items-center bg-[radial-gradient(#2d3748_1px,transparent_1px)] bg-[length:20px_20px]">
          <PreviewHost />
        </div>
      </div>
    </div>
  );
};

export default LayoutLabApp;
