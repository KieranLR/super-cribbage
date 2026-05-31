import { ANCHORS, VALUE_MODES } from "../../shared/layout/layoutSchema.js";

const DEFAULT_CONFIG = {
    anchor: ANCHORS.CENTER,
    x: { mode: VALUE_MODES.PX, value: 0 },
    y: { mode: VALUE_MODES.PX, value: 0 },
    offsetX: 0,
    offsetY: 0,
    percentOffsetX: 0,
    percentOffsetY: 0,
    onLayout: null
};

/**
 * Applies anchor-based positioning to a game object and keeps it updated on resize.
 */
export class AnchorLayoutComponent {

    /**
     * @param {Phaser.Scene} scene
     * @param {Phaser.GameObjects.GameObject|object} target
     * @param {object} config
     */
    constructor(scene, target, config = {}) {
        this.scene = scene;
        this.target = target;
        this.config = { ...DEFAULT_CONFIG, ...config };
        this._onResize = null;
        this._onShutdown = null;
        this.inspectableId = null;
        this.registry = null;
        this.isDestroyed = false;

        this.bindSceneEvents();
        this.applyLayout();
    }

    static bind(scene, bindings = []) {
        return bindings
            .filter((binding) => binding && binding.target)
            .map((binding) => {
                const component = new AnchorLayoutComponent(scene, binding.target, binding.layout || {});
                const editorConfig = binding.editor;

                if (editorConfig && editorConfig.id) {
                    component.registerInspectable(editorConfig);
                }

                return component;
            });
    }

    bindSceneEvents() {
        this._onResize = (gameSize) => {
            if (!this.scene.scene.isActive()) {
                return;
            }

            this.applyLayout(gameSize.width, gameSize.height);
        };

        this._onShutdown = () => {
            this.destroy();
        };

        this.scene.scale.on("resize", this._onResize);
        this.scene.events.once("shutdown", this._onShutdown);
    }

    updateConfig(nextConfig = {}, shouldApply = true) {
        this.config = { ...this.config, ...nextConfig };
        if (shouldApply) {
            this.applyLayout();
        }
    }

    applyLayout(widthArg, heightArg) {
        if (!this.target) {
            return;
        }

        const width = widthArg ?? this.scene.scale.width;
        const height = heightArg ?? this.scene.scale.height;
        const { anchor, x: xConfig, y: yConfig, offsetX, offsetY, percentOffsetX, percentOffsetY, onLayout } = this.config;
        const anchorPoint = this.resolveAnchor(anchor, width, height);
        const axisX = this.resolveAxisValue(xConfig, width);
        const axisY = this.resolveAxisValue(yConfig, height);

        const x = anchorPoint.x + axisX + offsetX + (percentOffsetX * width);
        const y = anchorPoint.y + axisY + offsetY + (percentOffsetY * height);

        if (typeof this.target.setPosition === "function") {
            this.target.setPosition(x, y);
        } else {
            this.target.x = x;
            this.target.y = y;
        }

        if (typeof onLayout === "function") {
            onLayout({ width, height, x, y, target: this.target });
        }
    }

    applyEditorLayout(layout, widthArg, heightArg) {
        if (!layout || !this.target || !this.scene) {
            return;
        }

        const width = widthArg ?? this.scene.scale.width;
        const height = heightArg ?? this.scene.scale.height;

        this.updateConfig({
            anchor: layout.anchor ?? this.config.anchor,
            x: layout.x ?? this.config.x,
            y: layout.y ?? this.config.y,
            offsetX: layout.offsetX ?? this.config.offsetX,
            offsetY: layout.offsetY ?? this.config.offsetY,
            percentOffsetX: layout.percentOffsetX ?? 0,
            percentOffsetY: layout.percentOffsetY ?? 0
        }, false);

        this.applyLayout(width, height);

        if (layout.scale !== undefined && typeof this.target.setScale === "function") {
            this.target.setScale(layout.scale);
        }

        if (layout.visible !== undefined && typeof this.target.setVisible === "function") {
            this.target.setVisible(layout.visible);
        }
    }

    resolveAxisValue(axisConfig, size) {
        if (!axisConfig) {
            return 0;
        }

        if (axisConfig.mode === VALUE_MODES.PERCENT) {
            return (axisConfig.value || 0) * size;
        }

        return axisConfig.value || 0;
    }

    registerInspectable(options = {}) {
        const {
            id,
            label = id,
            type = "layoutObject",
            editableLayoutKey = id,
            supportsLayout = true,
            customProperties = [],
            applyCustomValues = null,
            defaultLayout = null
        } = options;

        if (!id) {
            return;
        }

        this.inspectableId = id;

        import("../../editor/preview/InspectableRegistry.js").then(({ inspectableRegistry }) => {
            if (this.isDestroyed || !this.target) {
                return;
            }

            this.registry = inspectableRegistry;
            this.registry.register({
                id,
                label,
                type,
                gameObject: this.target,
                editableLayoutKey,
                supportsLayout,
                customProperties,
                applyCustomValues,
                applyLayout: (layout, viewWidth, viewHeight) => this.applyEditorLayout(layout, viewWidth, viewHeight),
                defaultLayout: defaultLayout || this.createDefaultEditorLayout()
            });
        }).catch(() => {
            // Ignore when editor modules are unavailable in runtime-only mode.
        });
    }

    createDefaultEditorLayout() {
        const targetScale = this.target?.scaleX ?? 1;
        const visible = this.target?.visible !== false;

        return {
            anchor: this.config.anchor,
            x: this.config.x || { mode: VALUE_MODES.PX, value: 0 },
            y: this.config.y || { mode: VALUE_MODES.PX, value: 0 },
            offsetX: this.config.offsetX,
            offsetY: this.config.offsetY,
            percentOffsetX: this.config.percentOffsetX,
            percentOffsetY: this.config.percentOffsetY,
            scale: targetScale,
            visible
        };
    }

    unregisterInspectable() {
        if (this.registry && this.inspectableId) {
            this.registry.unregister(this.inspectableId);
        }
        this.registry = null;
        this.inspectableId = null;
    }

    resolveAnchor(anchor, width, height) {
        switch (anchor) {
            case ANCHORS.TOP_LEFT:
                return { x: 0, y: 0 };
            case ANCHORS.TOP_CENTER:
                return { x: width / 2, y: 0 };
            case ANCHORS.TOP_RIGHT:
                return { x: width, y: 0 };
            case ANCHORS.CENTER_LEFT:
                return { x: 0, y: height / 2 };
            case ANCHORS.CENTER:
                return { x: width / 2, y: height / 2 };
            case ANCHORS.CENTER_RIGHT:
                return { x: width, y: height / 2 };
            case ANCHORS.BOTTOM_LEFT:
                return { x: 0, y: height };
            case ANCHORS.BOTTOM_CENTER:
                return { x: width / 2, y: height };
            case ANCHORS.BOTTOM_RIGHT:
                return { x: width, y: height };
            default:
                return { x: width / 2, y: height / 2 };
        }
    }

    destroy() {
        if (this.isDestroyed) {
            return;
        }

        this.isDestroyed = true;

        if (this.scene && this._onResize) {
            this.scene.scale.off("resize", this._onResize);
            this._onResize = null;
        }

        if (this.scene && this._onShutdown) {
            this.scene.events.off("shutdown", this._onShutdown);
            this._onShutdown = null;
        }

        this.unregisterInspectable();

        this.scene = null;
        this.target = null;
    }
}
