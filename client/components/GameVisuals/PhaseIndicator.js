import { TableLayout } from '../../utils/TableLayout.js';
export class PhaseIndicator extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {Object} config
     */
    constructor(scene, x, y, config) {
        super(scene, x, y);
        this.config = config;

        this.bg = scene.add.rectangle(0, 0, this.config.WIDTH, this.config.HEIGHT, 0x000000, 0.6)
            .setStrokeStyle(2, 0x028af8, 1);
        this.add(this.bg);

        this.phaseText = scene.add.text(0, this.config.PHASE_Y, 'PHASE', {
            fontSize: this.config.WIDTH < 350 ? '22px' : '28px',
            color: '#028af8',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.phaseText);

        this.instructionText = scene.add.text(0, this.config.INSTRUCTION_Y, 'Please wait...', {
            fontSize: this.config.WIDTH < 350 ? '14px' : '18px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: this.config.WIDTH - 20 }
        }).setOrigin(0.5);
        this.add(this.instructionText);

        this.updateLayout();
        scene.add.existing(this);
    }

    /**
     * Updates the config and refreshes visual layout.
     * @param {Object} config 
     */
    updateConfig(config) {
        this.config = config;
        this.updateLayout();
    }

    updateLayout() {
        const config = this.config;
        const isSmall = config.WIDTH < 350;

        this.bg.setSize(config.WIDTH, config.HEIGHT);
        
        this.phaseText.setY(config.PHASE_Y);
        this.phaseText.setFontSize(isSmall ? '22px' : '28px');
        
        this.instructionText.setY(config.INSTRUCTION_Y);
        this.instructionText.setFontSize(isSmall ? '14px' : '18px');
        this.instructionText.setWordWrapWidth(config.WIDTH - 20);
    }

    updatePhase(phase, instruction = '') {
        this.phaseText.setText(phase);
        this.instructionText.setText(instruction);
    }
}