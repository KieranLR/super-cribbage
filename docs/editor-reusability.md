# Reusable Editor Integration Strategies

This document explores various ways to simplify the registration of game objects with the Layout Editor, reducing boilerplate and improving readability.

## 1. The Utility Bridge (Recommended)
Create a dedicated utility that handles the dynamic import and the lifecycle of the registration (auto-unregistering on scene shutdown).

**File:** `client/utils/editorBridge.js`
```javascript
/**
 * Registers a game object with the Layout Editor.
 * Automatically handles dynamic imports and unregisters on scene shutdown.
 */
export function registerWithEditor(scene, options) {
    const { id, label, gameObject, type = 'sprite', editableLayoutKey } = options;

    // Only attempt to register if we might be in editor mode
    // (You can also check a global flag or registry value here)
    
    import('../editor/preview/InspectableRegistry')
        .then(({ inspectableRegistry }) => {
            inspectableRegistry.register({
                id,
                label,
                type,
                gameObject,
                editableLayoutKey: editableLayoutKey || id
            });

            // Auto-clean up when the scene stops
            scene.events.once('shutdown', () => {
                inspectableRegistry.unregister(id);
            });
        })
        .catch(() => {
            // Silently fail in production where the editor folder might not exist
        });
}
```

**Usage in Scene:**
```javascript
import { registerWithEditor } from '../utils/editorBridge';

// ... inside create()
const title = this.add.text(...);
registerWithEditor(this, {
    id: 'mainMenuTitle',
    label: 'Main Menu Title',
    gameObject: title
});
```

---

## 2. Phaser Scene Extension
If you find yourself registering many objects per scene, you can add a helper method directly to your Scene class or a BaseScene.

**Implementation:**
```javascript
// In a BaseScene.js or directly in your Scene
export class BaseScene extends Phaser.Scene {
    registerInspectable(id, label, gameObject, type = 'text') {
        import('../editor/preview/InspectableRegistry').then(({ inspectableRegistry }) => {
            inspectableRegistry.register({
                id,
                label,
                type,
                gameObject,
                editableLayoutKey: id
            });
            this.events.once('shutdown', () => inspectableRegistry.unregister(id));
        }).catch(() => {});
    }
}
```

**Usage:**
```javascript
this.registerInspectable('mainMenuTitle', 'Main Menu Title', title);
```

---

## 3. Custom Phaser Plugin
A plugin is the most "Phaser-native" way to extend functionality across all scenes without inheritance.

**File:** `client/plugins/EditorPlugin.js`
```javascript
export class EditorPlugin extends Phaser.Plugins.ScenePlugin {
    add(gameObject, { id, label, type }) {
        import('../editor/preview/InspectableRegistry').then(({ inspectableRegistry }) => {
            inspectableRegistry.register({
                id,
                label,
                type: type || gameObject.type,
                gameObject,
                editableLayoutKey: id
            });
            this.scene.events.once('shutdown', () => inspectableRegistry.unregister(id));
        }).catch(() => {});
    }
}
```

**Registration in `main.js`:**
```javascript
const config = {
    // ...
    plugins: {
        scene: [
            { key: 'editor', plugin: EditorPlugin, mapping: 'editor' }
        ]
    }
};
```

**Usage:**
```javascript
this.editor.add(title, { id: 'mainMenuTitle', label: 'Main Menu Title' });
```

---

## 4. GameObject Monkey Patching
You can extend the Phaser GameObject prototype once at boot time. This makes it available on every sprite, text, or container automatically.

**Implementation (e.g., in `Boot.js`):**
```javascript
Phaser.GameObjects.GameObject.prototype.inspect = function(id, label) {
    const scene = this.scene;
    import('../editor/preview/InspectableRegistry').then(({ inspectableRegistry }) => {
        inspectableRegistry.register({
            id,
            label,
            type: this.type,
            gameObject: this,
            editableLayoutKey: id
        });
        scene.events.once('shutdown', () => inspectableRegistry.unregister(id));
    }).catch(() => {});
    return this; // Allow chaining
};
```

**Usage:**
```javascript
const title = this.add.text(x, y, 'Title').inspect('mainMenuTitle', 'Main Menu Title');
```

---

## Comparison Summary

| Method | Pro | Con |
| :--- | :--- | :--- |
| **Utility** | Explicit, easy to find, no global side effects. | Requires manual import in every scene. |
| **Extension** | Clean syntax, built-in to your scene structure. | Requires a BaseScene or multiple edits. |
| **Plugin** | Most "Phaser-like", available via `this.editor`. | Requires plugin registration in game config. |
| **Monkey Patch** | Easiest usage (`.inspect()`), allows chaining. | Modifies global prototypes; less explicit. |
