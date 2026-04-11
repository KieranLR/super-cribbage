import { TableLayout } from '../../utils/TableLayout.js';
export class PhaseIndicator extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     */
    constructor(scene, x, y) {
        super(scene, x, y);

        const config = TableLayout.REL.PHASE_INDICATOR;
        const bg = scene.add.rectangle(0, 0, config.WIDTH, config.HEIGHT, 0x000000, 0.6)
            .setStrokeStyle(2, 0x028af8, 1);
        this.add(bg);

        this.phaseText = scene.add.text(0, config.PHASE_Y, 'PHASE', {
            fontSize: '28px',
            color: '#028af8',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add(this.phaseText);

        this.instructionText = scene.add.text(0, config.INSTRUCTION_Y, 'Please wait...', {
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