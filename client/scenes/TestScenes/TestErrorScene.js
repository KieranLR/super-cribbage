import { Scene } from 'phaser';

export class TestErrorScene extends Scene {
    constructor() {
        super({ key: 'TestErrorScene' });
    }

    create() {
        console.log('TestErrorScene: create() starting...');

        console.log(this.sys);
        
        // This scene is designed to throw an error in create() to test the ErrorHandler
        throw new Error('Test Error in TestErrorScene create()');
    }

    init() {
        // throw new Error('Test Error in TestErrorScene update()');
    }
}
