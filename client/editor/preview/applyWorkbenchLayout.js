import { ANCHORS, VALUE_MODES } from '../../shared/layout/layoutSchema';
import { inspectableRegistry } from './InspectableRegistry';

/**
 * Given current workbench state, applies layout to live Phaser objects.
 */
export function applyWorkbenchLayout(state) {
    const { layoutConfig, activeBreakpoint, viewportWidth, viewportHeight, selectedObjectId } = state;

    if (!layoutConfig || !layoutConfig.objects) return;

    // Clear all highlights first if possible or handle in the loop
    // A better way is to iterate over the registry
    inspectableRegistry.objects.forEach((entry, id) => {
        const gameObject = entry.gameObject;
        if (!gameObject) return;

        const baseLayout = layoutConfig.objects[id];
        
        if (baseLayout) {
            const mergedLayout = getEffectiveObjectLayout(baseLayout, activeBreakpoint);
            applyObjectLayout(gameObject, mergedLayout, viewportWidth, viewportHeight);
        }

        // Apply highlight (Step 11)
        if (id === selectedObjectId) {
            if (gameObject.setTint) {
                gameObject.setTint(0x00ffff);
            } else if (gameObject.list) { // It's a container
                 // For containers, maybe we can't tint easily, but we could add a temporary outline
            }
        } else {
            if (gameObject.clearTint) {
                gameObject.clearTint();
            }
        }
    });
}

function getEffectiveObjectLayout(base, breakpoint) {
    if (breakpoint === 'desktop' || !base.breakpoints || !base.breakpoints[breakpoint]) {
        return base;
    }
    return { ...base, ...base.breakpoints[breakpoint] };
}

function applyObjectLayout(gameObject, layout, viewWidth, viewHeight) {
    const { anchor, x, y, offsetX, offsetY, scale, visible } = layout;

    // 1. Calculate base anchor position
    let anchorX = 0;
    let anchorY = 0;

    switch (anchor) {
        case 'topLeft': anchorX = 0; anchorY = 0; break;
        case 'topCenter': anchorX = viewWidth / 2; anchorY = 0; break;
        case 'topRight': anchorX = viewWidth; anchorY = 0; break;
        case 'centerLeft': anchorX = 0; anchorY = viewHeight / 2; break;
        case 'center': anchorX = viewWidth / 2; anchorY = viewHeight / 2; break;
        case 'centerRight': anchorX = viewWidth; anchorY = viewHeight / 2; break;
        case 'bottomLeft': anchorX = 0; anchorY = viewHeight; break;
        case 'bottomCenter': anchorX = viewWidth / 2; anchorY = viewHeight; break;
        case 'bottomRight': anchorX = viewWidth; anchorY = viewHeight; break;
        default: anchorX = 0; anchorY = 0;
    }

    // 2. Resolve X and Y from modes
    const posX = x.mode === VALUE_MODES.PERCENT ? (x.value * viewWidth) : x.value;
    const posY = y.mode === VALUE_MODES.PERCENT ? (y.value * viewHeight) : y.value;

    // 3. Apply to object
    // Note: If x and y are relative to anchor, we add them. 
    // In many systems, x/y *is* the anchor position if mode is used as an offset from 0.
    // Based on the prompt's schema example, x: {mode: 'percent', value: 1} and anchor: 'topRight'
    // seems to mean they are used together.
    
    gameObject.x = anchorX + posX + (offsetX || 0);
    gameObject.y = anchorY + posY + (offsetY || 0);
    
    if (scale !== undefined) {
        gameObject.setScale(scale);
    }
    
    if (visible !== undefined) {
        gameObject.setVisible(visible);
    }
}
