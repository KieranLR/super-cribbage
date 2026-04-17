import { settingsManager } from '../../utils/SettingsManager.js';

describe('SettingsManager', () => {
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

        const saved = localStorage.getItem('super-cribbage-settings');
        expect(JSON.parse(saved).showBotHand).toBe(true);
    });

    test('should load settings from localStorage', () => {
        localStorage.setItem(
            'super-cribbage-settings',
            JSON.stringify({ showBotHand: true })
        );

        settingsManager.load();

        expect(settingsManager.get('showBotHand')).toBe(true);
    });
});