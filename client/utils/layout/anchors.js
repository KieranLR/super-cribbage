/**
 * Helper functions for placing things relative to anchors
 */

export const getAnchors = ({ width, height, pad }) => ({
    topLeft: () => ({ x: pad, y: pad }),
    topCenter: () => ({ x: width / 2, y: pad }),
    topRight: () => ({ x: width - pad, y: pad }),
    center: () => ({ x: width / 2, y: height / 2 }),
    bottomCenter: () => ({ x: width / 2, y: height - pad }),
    bottomLeft: () => ({ x: pad, y: height - pad }),
    bottomRight: () => ({ x: width - pad, y: height - pad }),
    rightCenter: () => ({ x: width - pad, y: height / 2 }),
    leftCenter: () => ({ x: pad, y: height / 2 })
});

/**
 * Resolves a position based on an anchor and offsets
 */
export function resolveAnchor(anchors, anchorName, offsetX = 0, offsetY = 0) {
    const anchorFn = anchors[anchorName];
    if (!anchorFn) {
        console.warn(`Anchor ${anchorName} not found`);
        return { x: 0, y: 0 };
    }
    const base = anchorFn();
    return {
        x: base.x + offsetX,
        y: base.y + offsetY
    };
}

/**
 * Resolves a position within a zone.
 */
export function resolveInZone(zones, zoneName, xAlign = 0.5, yAlign = 0.5, offsetX = 0, offsetY = 0) {
    const zone = zones[zoneName];
    if (!zone) {
        console.warn(`Zone ${zoneName} not found`);
        return { x: 0, y: 0 };
    }

    return {
        x: zone.x + zone.width * xAlign + offsetX,
        y: zone.y + zone.height * yAlign + offsetY
    };
}
