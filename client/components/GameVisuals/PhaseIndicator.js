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
        this.config = config || TableLayout.REL.PHASE_INDICATOR;

        const configLocal = this.config;
        const bg = scene.add.rectangle(0, 0, configLocal.WIDTH, configLocal.HEIGHT, 0x000000, 0.6)
            .setStrokeStyle(2, 0x028af8, 1);
        this.add(bg);

        this.phaseText = scene.add.text(0, configLocal.PHASE_Y, 'PHASE', {
            fontSize: '28px',
            color: '#028af8',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.phaseText);

        this.instructionText = scene.add.text(0, configLocal.INSTRUCTION_Y, 'Please wait...', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.add(this.instructionText);

        scene.add.existing(this);
    }

    updatePhase(phase, instruction = '') {
        this.phaseText.setText(phase);
        this.instructionText.setText(instruction);
    }
}