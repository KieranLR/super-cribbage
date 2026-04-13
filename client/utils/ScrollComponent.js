export class ScrollComponent {
    /**
     * @param {Phaser.Scene} scene
     * @param {Phaser.GameObjects.Container} container
     */
    constructor(scene, container) {
        this.scene = scene;
        this.container = container;
        this.contentHeight = 0;
        this.visibleHeight = 0;
        this.isScrollingEnabled = false;

        // Visual indicator (Scrollbar)
        this.scrollbarTrack = scene.add.rectangle(0, 0, 8, 0, 0xffffff, 0.2).setOrigin(1, 0).setDepth(100);
        this.scrollbarHandle = scene.add.rectangle(0, 0, 8, 0, 0xffffff, 0.5).setOrigin(1, 0).setDepth(101);
        this.scrollbarTrack.setVisible(false);
        this.scrollbarHandle.setVisible(false);

        this.setupInput();
    }

    setupInput() {
        this.onWheel = (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (!this.isScrollingEnabled) return;
            this.container.y -= deltaY;
            this.clampScroll();
        };

        this.onPointerMove = (pointer) => {
            if (!this.isScrollingEnabled || !pointer.isDown) return;
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
            this.scrollbarTrack.setVisible(true);
            this.scrollbarHandle.setVisible(true);
            
            this.scrollbarTrack.setPosition(width - 5, 0);
            this.scrollbarTrack.height = visibleHeight;
            
            const handleHeight = (visibleHeight / contentHeight) * visibleHeight;
            this.scrollbarHandle.height = Math.max(20, handleHeight);
            this.scrollbarHandle.setPosition(width - 5, 0);
            
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
        
        const scrollPercent = Math.abs(this.container.y) / (this.contentHeight - this.visibleHeight);
        const maxHandleY = this.visibleHeight - this.scrollbarHandle.height;
        this.scrollbarHandle.y = scrollPercent * maxHandleY;
    }

    destroy() {
        this.scene.input.off('wheel', this.onWheel);
        this.scene.input.off('pointermove', this.onPointerMove);
        this.scrollbarTrack.destroy();
        this.scrollbarHandle.destroy();
    }
}
