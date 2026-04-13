export const createMenuButton = (scene, label, callback, options = {}) => {
    const width = options.width || 420;
    const height = options.height || 60;
    const fontSize = options.fontSize || '28px';

    const background = scene.add.rectangle(0, 0, width, height, 0x000000, 0.65)
        .setStrokeStyle(2, 0xffffff);

    const text = scene.add.text(0, 0, label, {
        fontFamily: 'Arial',
        fontSize: fontSize,
        color: '#ffffff'
    }).setOrigin(0.5);

    const button = scene.add.container(0, 0, [background, text]);
    button.setSize(width, height);

    button.setInteractive({ useHandCursor: true });

    let baseScale = 1;

    // Use a custom method to set scale that preserves base scale if needed
    // But better yet, just let the button handle its own hover scale relative to its current scale
    // Or just store the scale we WANT it to be at.
    
    const updateHoverScale = (isHovering) => {
        const targetScale = isHovering ? 1.05 : 1;
        button.setScale(button.baseScale ? button.baseScale * targetScale : targetScale);
    };

    button.on('pointerover', () => {
        background.setFillStyle(0x333333, 0.85);
        background.setStrokeStyle(3, 0x00ff99);
        updateHoverScale(true);
    });

    button.on('pointerout', () => {
        background.setFillStyle(0x000000, 0.65);
        background.setStrokeStyle(2, 0xffffff);
        updateHoverScale(false);
    });

    button.on('pointerdown', () => {
        const currentBase = button.baseScale || 1;
        button.setScale(currentBase * 0.95);
    });

    button.on('pointerup', () => {
        updateHoverScale(true);
        if (callback) callback();
    });

    button.updateSize = (newWidth, newHeight) => {
        background.setSize(newWidth, newHeight);
        button.setSize(newWidth, newHeight);
    };

    button.updateLabel = (newLabel) => {
        text.setText(newLabel);
    };

    button.updateFontSize = (newFontSize) => {
        text.setFontSize(newFontSize);
    };

    return button;
}