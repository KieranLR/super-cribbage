/**
 * Utility for tracking and waiting for animations to complete.
 * This is used to synchronize UI state changes with animation completion.
 */
export class RoundFlow {
    constructor(scene, animator, view) {
        this.scene = scene;
        this.animator = animator;
        this.view = view;
        this.activeAnimations = 0;
        this.onAllAnimationsComplete = null;
    }

    /**
     * Starts tracking an animation.
     */
    startAnimation() {
        this.activeAnimations++;
    }

    /**
     * Ends tracking an animation and triggers completion callback if it was the last one.
     */
    endAnimation() {
        this.activeAnimations--;
        if (this.activeAnimations === 0 && this.onAllAnimationsComplete) {
            const callback = this.onAllAnimationsComplete;
            this.onAllAnimationsComplete = null;
            callback();
        }
    }

    /**
     * Sets a callback for when all currently tracked animations complete.
     */
    waitForAnimations(callback) {
        if (this.activeAnimations === 0) {
            callback();
        } else {
            this.onAllAnimationsComplete = callback;
        }
    }
}
