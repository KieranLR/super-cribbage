import { settingsManager } from '../client/utils/SettingsManager.js';

describe('SettingsManager', () => {
    beforeEach(() => {
        // Mock localStorage manually
        global.localStorage = {
            getItem: (key) => global.localStorage[key] || null,
            setItem: (key, value) => { global.localStorage[key] = value },
            clear: () => { 
                Object.keys(global.localStorage).forEach(key => {
                    if (typeof global.localStorage[key] === 'string') delete global.localStorage[key];
                });
            }
        };
        // Reset settingsManager state
        settingsManager.settings = { 
            showBotHand: false,
            fastMode: false,
            cardDeck: 'default'
        };
    });

    afterEach(() => {
        delete global.localStorage;
    });

    test('should have default settings', () => {
        expect(settingsManager.get('showBotHand')).toBe(false);
        expect(settingsManager.get('cardDeck')).toBe('default');
    });

    test('should set and get a setting', () => {
        settingsManager.set('showBotHand', true);
        expect(settingsManager.get('showBotHand')).toBe(true);
    });

    test('should persist settings to localStorage', () => {
        settingsManager.set('showBotHand', true);
        const saved = global.localStorage.getItem('super-cribbage-settings');
        expect(JSON.parse(saved).showBotHand).toBe(true);
    });

    test('should load settings from localStorage', () => {
        global.localStorage.setItem('super-cribbage-settings', JSON.stringify({ showBotHand: true }));
        settingsManager.load();
        expect(settingsManager.get('showBotHand')).toBe(true);
    });
});
