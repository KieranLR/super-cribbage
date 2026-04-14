import { TOKENS } from './tokens.js';
import { PRESETS } from './presets.js';

class LayoutConfigManager {
    constructor() {
        this.tokens = JSON.parse(JSON.stringify(TOKENS));
        this.presets = JSON.parse(JSON.stringify(PRESETS));
        this.listeners = [];
    }

    getTokens() {
        return this.tokens;
    }

    getPresets() {
        return this.presets;
    }

    updateToken(path, value) {
        const keys = path.split('.');
        let obj = this.tokens;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!obj[keys[i]]) return; // Path doesn't exist
            obj = obj[keys[i]];
        }
        const lastKey = keys[keys.length - 1];
        if (obj[lastKey] !== undefined) {
            obj[lastKey] = value;
            this.notify();
        }
    }

    updatePresetValue(presetName, path, value) {
        if (this.presets[presetName]) {
            const keys = path.split('.');
            let obj = this.presets[presetName];
            for (let i = 0; i < keys.length - 1; i++) {
                if (!obj[keys[i]]) obj[keys[i]] = {};
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;
            this.notify();
        }
    }

    reset() {
        this.tokens = JSON.parse(JSON.stringify(TOKENS));
        this.presets = JSON.parse(JSON.stringify(PRESETS));
        this.notify();
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    notify() {
        this.listeners.forEach(callback => callback(this.tokens, this.presets));
    }
}

export const layoutConfigManager = new LayoutConfigManager();
