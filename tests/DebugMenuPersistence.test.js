import { settingsManager } from '../client/utils/SettingsManager.js';

describe('DebugMenu Persistence', () => {
    beforeEach(() => {
        // Mock localStorage manually
        global.localStorage = {
            'super-cribbage-settings': null,
            getItem: function(key) { return this[key]; },
            setItem: function(key, value) { this[key] = value; },
            clear: function() { this['super-cribbage-settings'] = null; }
        };
        // Reset settingsManager state
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
        
        const saved = JSON.parse(global.localStorage.getItem('super-cribbage-settings'));
        expect(saved.debugMenuCollapsed).toBe(false);
    });

    test('should load debugMenuCollapsed state from localStorage', () => {
        global.localStorage.setItem('super-cribbage-settings', JSON.stringify({ debugMenuCollapsed: false }));
        settingsManager.load();
        expect(settingsManager.get('debugMenuCollapsed')).toBe(false);
    });
});
