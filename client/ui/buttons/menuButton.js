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

    button.on('pointerover', () => {
        background.setFillStyle(0x333333, 0.85);
        background.setStrokeStyle(3, 0x00ff99);
        button.setScale(1.05);
    });

    button.on('pointerout', () => {
        background.setFillStyle(0x000000, 0.65);
        background.setStrokeStyle(2, 0xffffff);
        button.setScale(1);
    });

    button.on('pointerdown', () => {
        button.setScale(0.95);
    });

    button.on('pointerup', () => {
        button.setScale(1.05);
        if (callback) callback();
    });

    return button;
}