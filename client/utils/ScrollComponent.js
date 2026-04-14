import { settingsManager } from './SettingsManager.js';

export class ScrollComponent {
    /**
     * @param {Phaser.Scene} scene
     * @param {Phaser.GameObjects.Container} container
     * @param {Object} [options]
     * @param {boolean} [options.followDebugMenu=false] - If true, scrollbar will follow debug menu settings (side, visibility).
     * @param {number} [options.width=8] - Width of the scrollbar.
     * @param {number} [options.padding=0] - Padding from the edge.
     */
    constructor(scene, container, options = {}) {
        this.scene = scene;
        this.container = container;
        this.options = {
            followDebugMenu: false,
            width: 8,
            padding: 0,
            ...options
        };
        this.contentHeight = 0;
        this.visibleHeight = 0;
        this.isScrollingEnabled = false;
        this.isVisible = true;
        this.scrollbarX = 0;

        // Visual indicator (Scrollbar)
        const sbWidth = this.options.width;
        this.scrollbarTrack = scene.add.rectangle(0, 0, sbWidth, 0, 0xffffff, 0.2).setOrigin(1, 0).setDepth(100);
        this.scrollbarHandle = scene.add.rectangle(0, 0, sbWidth, 0, 0xffffff, 0.5).setOrigin(1, 0).setDepth(101);
        this.scrollbarTrack.setVisible(false);
        this.scrollbarHandle.setVisible(false);

        this.setupInput();
    }

    setupInput() {
        this.onWheel = (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (!this.isScrollingEnabled || !this.isVisible) return;
            this.container.y -= deltaY;
            this.clampScroll();
        };

        this.onPointerMove = (pointer) => {
            if (!this.isScrollingEnabled || !this.isVisible || !pointer.isDown) return;
            this.container.y += pointer.velocity.y * 1.5;
            this.clampScroll();
        };

        this.scene.input.on('wheel', this.onWheel);
        this.scene.input.on('pointermove', this.onPointerMove);
    }

    updateLayout(contentHeight, visibleHeight) {
        this.contentHeight = contentHeight;
        this.visibleHeight = visibleHeight;
        this.isScrollingEnabled = contentHeight > visibleHeight;

        if (this.isScrollingEnabled) {
            const { width } = this.scene.scale;
            let scrollbarX = width - this.options.padding;

            if (this.options.followDebugMenu) {
                const side = settingsManager.get('debugMenuSide') || 'left';
                const menuWidth = this.scene.menuWidth || 450;
                scrollbarX = side === 'left' ? menuWidth : width;
            }

            this.scrollbarX = scrollbarX;
            this.scrollbarTrack.setVisible(this.isVisible);
            this.scrollbarHandle.setVisible(this.isVisible);
            
            this.scrollbarTrack.setPosition(scrollbarX, 0);
            this.scrollbarTrack.height = visibleHeight;
            
            const handleHeight = (visibleHeight / contentHeight) * visibleHeight;
            this.scrollbarHandle.height = Math.max(20, handleHeight);
            this.scrollbarHandle.setPosition(scrollbarX, 0);
            
            this.updateScrollbarPosition();
        } else {
            this.container.y = 0;
            this.scrollbarTrack.setVisible(false);
            this.scrollbarHandle.setVisible(false);
        }
    }

    clampScroll() {
        const minY = this.visibleHeight - this.contentHeight;
        const maxY = 0;
        if (this.container.y < minY) this.container.y = minY;
        if (this.container.y > maxY) this.container.y = maxY;
        
        this.updateScrollbarPosition();
    }

    updateScrollbarPosition() {
        if (!this.isScrollingEnabled) return;
        
        const { width } = this.scene.scale;
        let currentScrollbarX = width - this.options.padding;

        if (this.options.followDebugMenu) {
            const side = settingsManager.get('debugMenuSide') || 'left';
            const menuWidth = this.scene.menuWidth || 450;
            currentScrollbarX = side === 'left' ? menuWidth : width;
        }

        if (this.scrollbarX !== currentScrollbarX) {
            this.scrollbarX = currentScrollbarX;
            this.scrollbarTrack.setX(this.scrollbarX);
            this.scrollbarHandle.setX(this.scrollbarX);
        }

        const scrollPercent = Math.abs(this.container.y) / (this.contentHeight - this.visibleHeight);
        const maxHandleY = this.visibleHeight - this.scrollbarHandle.height;
        this.scrollbarHandle.y = scrollPercent * maxHandleY;
    }

    setVisible(visible) {
        this.isVisible = visible;
        if (this.isScrollingEnabled) {
            this.scrollbarTrack.setVisible(visible);
            this.scrollbarHandle.setVisible(visible);
        } else {
            this.scrollbarTrack.setVisible(false);
            this.scrollbarHandle.setVisible(false);
        }
    }

    destroy() {
        this.scene.input.off('wheel', this.onWheel);
        this.scene.input.off('pointermove', this.onPointerMove);
        this.scrollbarTrack.destroy();
        this.scrollbarHandle.destroy();
    }
}
