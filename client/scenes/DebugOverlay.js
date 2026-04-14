import { Scene } from 'phaser';
import { settingsManager } from '../utils/SettingsManager.js';
import { TableLayout } from '../utils/TableLayout.js';
import { layoutConfigManager } from '../utils/layout/LayoutConfigManager.js';
import { ScrollComponent } from '../utils/ScrollComponent.js';

export class DebugOverlay extends Scene {
    constructor() {
        super({ key: 'DebugOverlay' });
    }

    create() {
        const { width, height } = this.scale;
        
        // Initialize layout to detect current screen size category
        this.layout = new TableLayout(this.scale);

        this.currentTab = 'Tokens'; // 'Tokens' or 'Presets'
        this.isMenuCollapsed = false; // Internal toggle state

        this.debugText = this.add.text(width - 10, 10, '', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#00ff00',
            backgroundColor: '#00000088',
            padding: { x: 4, y: 2 },
            align: 'right'
        }).setOrigin(1, 0).setDepth(2000).setScrollFactor(0);

        // Hamburger Icon (always visible if debug menu enabled in settings)
        this.createHamburgerIcon();

        // Debug Menu Container
        this.menuContainer = this.add.container(0, 0).setDepth(1900).setVisible(false);
        this.menuWidth = 450;
        this.menuBackground = this.add.rectangle(0, 0, this.menuWidth, height, 0x000000, 0.9)
            .setOrigin(0, 0);
        this.menuContainer.add(this.menuBackground);
        
        this.menuContent = this.add.container(0, 0);
        this.menuContainer.add(this.menuContent);

        this.scroller = new ScrollComponent(this, this.menuContent);
        this.scroller.setVisible(false);

        this.createDebugMenu();

        // Check initial state
        this.updateVisibility();

        // Listen for resize
        this.scale.on('resize', (gameSize) => {
            this.debugText.setX(gameSize.width - 10);
            this.menuBackground.height = gameSize.height;
            this.layout.refresh();
            this.updateMenuLayout();
            this.repositionButtons();
        });
    }

    createHamburgerIcon() {
        const size = 40;
        const padding = 10;
        this.hamburgerBtn = this.add.container(0, 0).setDepth(2000).setVisible(false);
        
        const bg = this.add.rectangle(0, 0, size, size, 0x000000, 0.7)
            .setStrokeStyle(2, 0x00ff00)
            .setInteractive({ useHandCursor: true });
        
        const lineStyle = { width: 20, height: 3, spacing: 6, color: 0x00ff00 };
        const line1 = this.add.rectangle(0, -lineStyle.spacing, lineStyle.width, lineStyle.height, lineStyle.color);
        const line2 = this.add.rectangle(0, 0, lineStyle.width, lineStyle.height, lineStyle.color);
        const line3 = this.add.rectangle(0, lineStyle.spacing, lineStyle.width, lineStyle.height, lineStyle.color);
        
        this.hamburgerBtn.add([bg, line1, line2, line3]);
        
        bg.on('pointerdown', () => {
            this.isMenuCollapsed = !this.isMenuCollapsed;
            this.updateVisibility();
        });

        bg.on('pointerover', () => bg.setFillStyle(0x222222, 0.9));
        bg.on('pointerout', () => bg.setFillStyle(0x000000, 0.7));

        // Side Toggle Button
        this.sideToggleBtn = this.add.container(0, 0).setDepth(2000).setVisible(false);
        const sideBg = this.add.rectangle(0, 0, size, size, 0x000000, 0.7)
            .setStrokeStyle(2, 0x00ff00)
            .setInteractive({ useHandCursor: true });
        
        const sideText = this.add.text(0, 0, 'L/R', {
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#00ff00'
        }).setOrigin(0.5);

        this.sideToggleBtn.add([sideBg, sideText]);

        sideBg.on('pointerdown', () => {
            const current = settingsManager.get('debugMenuSide') || 'left';
            const newValue = current === 'left' ? 'right' : 'left';
            settingsManager.set('debugMenuSide', newValue);
            this.updateVisibility();
        });

        sideBg.on('pointerover', () => sideBg.setFillStyle(0x222222, 0.9));
        sideBg.on('pointerout', () => sideBg.setFillStyle(0x000000, 0.7));

        this.repositionButtons();
    }

    repositionButtons() {
        const { width } = this.scale;
        const side = settingsManager.get('debugMenuSide') || 'left';
        const padding = 10;
        const size = 40;
        const spacing = 10;
        
        if (side === 'left') {
            this.hamburgerBtn.setPosition(padding + size / 2, padding + size / 2);
            this.sideToggleBtn.setPosition(padding + size + spacing + size / 2, padding + size / 2);
        } else {
            this.hamburgerBtn.setPosition(width - padding - size / 2, padding + size / 2);
            this.sideToggleBtn.setPosition(width - (padding + size + spacing + size / 2), padding + size / 2);
        }
    }

    createDebugMenu() {
        this.menuContent.removeAll(true);
        let currentY = 20;
        const margin = 15;

        // Tab Buttons
        const tabY = currentY;
        const createTab = (label, x, active) => {
            const btn = this.add.text(x, tabY, label, {
                fontSize: '20px',
                fontStyle: 'bold',
                color: active ? '#00ff00' : '#888888',
                backgroundColor: active ? '#222222' : '#000000',
                padding: { x: 20, y: 10 }
            })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.currentTab = label;
                this.createDebugMenu();
            });
            return btn;
        };

        const tokensTab = createTab('Tokens', margin, this.currentTab === 'Tokens');
        const presetsTab = createTab('Presets', margin + 120, this.currentTab === 'Presets');
        this.menuContent.add([tokensTab, presetsTab]);

        currentY += 60;

        if (this.currentTab === 'Tokens') {
            this.renderTokensMenu(currentY);
        } else {
            this.renderPresetsMenu(currentY);
        }
    }

    renderTokensMenu(startY) {
        const tokens = layoutConfigManager.getTokens();
        let currentY = startY;
        const spacing = 30;
        const margin = 15;

        const processTokens = (obj, path = '') => {
            for (const key in obj) {
                const val = obj[key];
                const fullPath = path ? `${path}.${key}` : key;

                if (typeof val === 'number') {
                    this.createSliderControl(margin, currentY, fullPath, val, (newValue) => {
                        layoutConfigManager.updateToken(fullPath, newValue);
                        this.refreshGameLayout();
                    });
                    currentY += spacing;
                } else if (typeof val === 'object' && val !== null) {
                    const titleColor = path === '' ? '#ffff00' : '#88ff88';
                    const fontSize = path === '' ? '18px' : '14px';
                    const title = this.add.text(margin, currentY, fullPath.toUpperCase(), {
                        fontSize: fontSize,
                        fontStyle: 'bold',
                        color: titleColor
                    });
                    this.menuContent.add(title);
                    currentY += spacing;
                    processTokens(val, fullPath);
                    currentY += 10;
                }
            }
        };

        processTokens(tokens);

        this.addResetButton(margin, currentY);
    }

    renderPresetsMenu(startY) {
        const presets = layoutConfigManager.getPresets();
        const currentSize = this.layout.size;
        const preset = presets[currentSize];

        let currentY = startY;
        const spacing = 30;
        const margin = 15;

        const titleText = this.add.text(margin, currentY, `Editing: ${currentSize}`, {
            fontSize: '16px',
            fontStyle: 'italic',
            color: '#aaaaaa'
        });
        this.menuContent.add(titleText);
        currentY += spacing + 10;

        const processObject = (obj, path = '') => {
            for (const key in obj) {
                const val = obj[key];
                const fullPath = path ? `${path}.${key}` : key;

                if (typeof val === 'number') {
                    this.createSliderControl(margin, currentY, fullPath, val, (newValue) => {
                        layoutConfigManager.updatePresetValue(currentSize, fullPath, newValue);
                        this.refreshGameLayout();
                    });
                    currentY += spacing;
                } else if (typeof val === 'object' && val !== null) {
                    const subTitle = this.add.text(margin, currentY, fullPath.toUpperCase(), {
                        fontSize: '14px',
                        fontStyle: 'bold',
                        color: '#ffff00'
                    });
                    this.menuContent.add(subTitle);
                    currentY += spacing;
                    processObject(val, fullPath);
                    currentY += 10;
                }
            }
        };

        processObject(preset);

        this.addResetButton(margin, currentY);
    }

    createSliderControl(margin, y, key, value, onUpdate) {
        const label = this.add.text(margin, y, `${key}:`, {
            fontSize: '12px',
            color: '#ffffff'
        });

        // Slider track
        const sliderX = 180;
        const sliderWidth = 180;
        const track = this.add.rectangle(sliderX, y + 7, sliderWidth, 4, 0x666666).setOrigin(0, 0.5);
        
        // Determine range for slider
        let min = 0;
        let max = 1000;
        if (value < 2 && value > -2) {
            min = -2;
            max = 2;
        } else if (value < 0) {
            min = value * 2;
            max = 0;
        } else {
            min = 0;
            max = Math.max(value * 2, 100);
        }

        const getXFromValue = (v) => sliderX + ((v - min) / (max - min)) * sliderWidth;
        const getValueFromX = (x) => {
            const pct = Phaser.Math.Clamp((x - sliderX) / sliderWidth, 0, 1);
            const v = min + pct * (max - min);
            return value < 2 && value > -2 ? parseFloat(v.toFixed(2)) : Math.round(v);
        };

        const handle = this.add.circle(getXFromValue(value), y + 7, 8, 0x00ff00)
            .setInteractive({ useHandCursor: true, draggable: true });
        
        this.input.setDraggable(handle);

        handle.on('dragstart', () => {
            this.scroller.isScrollingEnabled = false;
        });

        handle.on('dragend', () => {
            this.updateMenuLayout();
        });

        const valueText = this.add.text(sliderX + sliderWidth + 10, y, `${value}`, {
            fontSize: '14px',
            color: '#00ff00',
            backgroundColor: '#222222',
            padding: { x: 4, y: 2 }
        }).setInteractive({ useHandCursor: true });

        handle.on('drag', (pointer, dragX) => {
            const clampedX = Phaser.Math.Clamp(dragX, sliderX, sliderX + sliderWidth);
            handle.x = clampedX;
            const newValue = getValueFromX(clampedX);
            valueText.setText(`${newValue}`);
            onUpdate(newValue);
        });

        valueText.on('pointerdown', () => {
            const input = prompt(`Enter value for ${key}:`, value);
            if (input !== null) {
                const newValue = parseFloat(input);
                if (!isNaN(newValue)) {
                    onUpdate(newValue);
                    this.createDebugMenu(); // Rebuild to update slider/label
                }
            }
        });

        this.menuContent.add([label, track, handle, valueText]);
    }

    addResetButton(margin, y) {
        const resetBtn = this.add.text(margin, y, '[ RESET ALL ]', {
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#ff0000',
            backgroundColor: '#ffffff',
            padding: { x: 10, y: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            layoutConfigManager.reset();
            this.refreshGameLayout();
            this.createDebugMenu();
        });
        this.menuContent.add(resetBtn);
        this.updateMenuLayout(y + 60);
    }

    updateMenuLayout(contentHeight) {
        if (contentHeight) this.totalContentHeight = contentHeight;
        this.scroller.updateLayout(this.totalContentHeight || 1000, this.scale.height);
    }

    refreshGameLayout() {
        // Find active game scenes and tell them to refresh
        this.game.scene.getScenes(true).forEach(scene => {
            if (scene.layout && typeof scene.layout.refresh === 'function') {
                scene.layout.refresh();
                if (scene.view && typeof scene.view.resize === 'function') {
                    scene.view.resize(this.scale.width, this.scale.height);
                }
            }
        });
        this.layout.refresh();
    }

    update() {
        this.updateVisibility();

        if (this.debugText.visible) {
            const fps = Math.round(this.game.loop.actualFps);
            const layout = this.layout.size;
            const height = Math.round(this.scale.height);
            const isSmallHeight = height < 500 ? ' (SmallHeight)' : '';
            this.debugText.setText(`FPS: ${fps}\nLayout: ${layout}${isSmallHeight}\nH: ${height}`);
        }
    }

    updateVisibility() {
        const showFPS = settingsManager.get('showFPS');
        if (this.debugText.visible !== showFPS) {
            this.debugText.setVisible(showFPS);
        }

        const showDebugMenuSetting = settingsManager.get('showDebugMenu');
        const side = settingsManager.get('debugMenuSide') || 'left';
        
        // Icon visibility depends on the global setting
        if (this.hamburgerBtn.visible !== showDebugMenuSetting) {
            this.hamburgerBtn.setVisible(showDebugMenuSetting);
            this.sideToggleBtn.setVisible(showDebugMenuSetting);
        }
        this.repositionButtons();

        // Menu visibility depends on the global setting AND the manual toggle
        const shouldShowMenu = showDebugMenuSetting && !this.isMenuCollapsed;
        if (this.menuContainer.visible !== shouldShowMenu) {
            this.menuContainer.setVisible(shouldShowMenu);
            this.scroller.setVisible(shouldShowMenu);
        }

        if (shouldShowMenu) {
            const menuX = side === 'left' ? 0 : this.scale.width - this.menuWidth;
            this.menuContainer.setX(menuX);
            this.updateMenuLayout();
        }
    }
}
