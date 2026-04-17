import { settingsManager } from '../../utils/SettingsManager.js';

describe('DebugMenu Persistence', () => {
    beforeEach(() => {
        // Mock localStorage for Node environment
        global.localStorage = {
            store: {},
            getItem(key) {
                return this.store[key] ?? null;
            },
            setItem(key, value) {
                this.store[key] = String(value);
            },
            clear() {
                this.store = {};
            }
        };

        settingsManager.settings = {
            showBotHand: false,
            fastMode: false,
            cardDeck: 'default',
            showFPS: false,
            showDebugMenu: false,
            debugMenuSide: 'left',
            debugMenuCollapsed: true
        };
    });

    afterEach(() => {
        delete global.localStorage;
    });

    test('should have debugMenuCollapsed default to true', () => {
        expect(settingsManager.get('debugMenuCollapsed')).toBe(true);
    });

    test('should persist debugMenuCollapsed state', () => {
        settingsManager.set('debugMenuCollapsed', false);

        expect(settingsManager.get('debugMenuCollapsed')).toBe(false);

        const saved = JSON.parse(localStorage.getItem('super-cribbage-settings'));
        expect(saved.debugMenuCollapsed).toBe(false);
    });

    test('should load debugMenuCollapsed state from localStorage', () => {
        localStorage.setItem(
            'super-cribbage-settings',
            JSON.stringify({ debugMenuCollapsed: false })
        );

        settingsManager.load();

        expect(settingsManager.get('debugMenuCollapsed')).toBe(false);
    });
});