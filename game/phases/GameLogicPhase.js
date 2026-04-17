export class GameLogicPhase {
    constructor(gameState, eventEmitter) {
        this.gameState = gameState;
        this.eventEmitter = eventEmitter;
    }

    start() {
        // To be implemented by subclasses
    }

    emit(event, data) {
        if (this.eventEmitter) {
            this.eventEmitter.emit(event, data);
        }
    }

    checkWin() {
        const oldPhase = this.gameState.phase;
        if (this.gameState.checkWin()) {
            this.emit('phaseChanged', { phase: 'GAME_OVER', oldPhase });
            return true;
        }
        return false;
    }
}
