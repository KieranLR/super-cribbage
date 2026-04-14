class SettingsManager {
    constructor() {
        this.settings = {
            showBotHand: false,
            fastMode: false,
            cardDeck: 'default',
            showFPS: false,
            showDebugMenu: false,
            debugMenuSide: 'left',
            debugMenuCollapsed: true
        };
        this.load();
    }

    load() {
        if (typeof localStorage === 'undefined') return;
        const saved = localStorage.getItem('super-cribbage-settings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to parse settings:', e);
            }
        }
    }

    save() {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem('super-cribbage-settings', JSON.stringify(this.settings));
    }

    get(key) {
        return this.settings[key];
    }

    set(key, value) {
        this.settings[key] = value;
        this.save();
    }
}

export const settingsManager = new SettingsManager();
