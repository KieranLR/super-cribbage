/**
 * Registry for Phaser GameObjects that should be inspectable and editable in the layout editor.
 */

class InspectableRegistry {
    constructor() {
        this.objects = new Map();
        this.onUpdate = null;
    }

    /**
     * @param {Object} entry 
     * @param {string} entry.id Unique ID matching layout config key
     * @param {string} entry.label Human-readable name
     * @param {string} entry.type Type indicator (e.g., 'container', 'sprite', 'text')
     * @param {Phaser.GameObjects.GameObject} entry.gameObject The live Phaser object
     * @param {string} entry.editableLayoutKey The key in the layout config
     * @param {boolean} [entry.supportsLayout] Whether layout transform fields apply
     * @param {(layout: Object, viewWidth: number, viewHeight: number) => void} [entry.applyLayout]
     * @param {Object} [entry.defaultLayout] Optional per-object default layout config
     * @param {Array} [entry.customProperties] Custom editor fields to expose
     * @param {(values: Object) => void} [entry.applyCustomValues] Callback to apply custom values
     */
    register(entry) {
        const normalizedEntry = {
            supportsLayout: true,
            customProperties: [],
            ...entry
        };
        
        // Ensure object is interactive for click-to-select (Step 11)
        if (normalizedEntry.gameObject && normalizedEntry.gameObject.setInteractive) {
            normalizedEntry.gameObject.setInteractive();
        }

        this.objects.set(normalizedEntry.id, normalizedEntry);
        this.notify();
    }

    unregister(id) {
        this.objects.delete(id);
        this.notify();
    }

    clear() {
        this.objects.clear();
        this.notify();
    }

    getAll() {
        return Array.from(this.objects.values()).map(obj => ({
            id: obj.id,
            label: obj.label,
            type: obj.type,
            editableLayoutKey: obj.editableLayoutKey,
            supportsLayout: obj.supportsLayout !== false,
            customProperties: obj.customProperties || [],
            defaultLayout: obj.defaultLayout || null
        }));
    }

    get(id) {
        return this.objects.get(id);
    }

    notify() {
        if (this.onUpdate) {
            this.onUpdate(this.getAll());
        }
    }

    setUpdateCallback(callback) {
        this.onUpdate = callback;
        this.notify();
    }
}

export const inspectableRegistry = new InspectableRegistry();
