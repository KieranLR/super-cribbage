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
     */
    register(entry) {
        this.objects.set(entry.id, entry);
        
        // Ensure object is interactive for click-to-select (Step 11)
        if (entry.gameObject && entry.gameObject.setInteractive) {
            entry.gameObject.setInteractive();
        }

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
            editableLayoutKey: obj.editableLayoutKey
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
