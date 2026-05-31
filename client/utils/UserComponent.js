/**
 * Reusable runtime component for exposing user-defined editable values
 * to the layout editor's inspectable registry.
 */
export class UserComponent {
    /**
     * @param {Object} config
     * @param {string} config.id
     * @param {string} config.label
     * @param {string} [config.type]
     * @param {Phaser.GameObjects.GameObject|null} [config.gameObject]
     * @param {boolean} [config.supportsLayout]
     * @param {Array<{key: string, label?: string, type?: string, defaultValue?: any, min?: number, max?: number, step?: number}>} [config.properties]
     * @param {(values: Object, patch: Object) => void} [config.onChange]
     */
    constructor(config) {
        this.id = config.id;
        this.label = config.label || config.id;
        this.type = config.type || "userComponent";
        this.gameObject = config.gameObject || null;
        this.supportsLayout = config.supportsLayout !== false;
        this.properties = this.normalizeProperties(config.properties);
        this.onChange = typeof config.onChange === "function" ? config.onChange : null;

        this.values = this.getDefaultValues();
        this.registry = null;
        this.isDestroyed = false;
    }

    normalizeProperties(properties) {
        if (!Array.isArray(properties)) {
            return [];
        }

        return properties
            .filter((property) => property && typeof property.key === "string" && property.key.length > 0)
            .map((property) => ({
                key: property.key,
                label: property.label || property.key,
                type: property.type || "number",
                defaultValue: property.defaultValue,
                min: property.min,
                max: property.max,
                step: property.step
            }));
    }

    getDefaultValueByType(type) {
        switch (type) {
            case "color":
                return "#ffffff";
            case "boolean":
                return false;
            case "string":
                return "";
            case "number":
            default:
                return 0;
        }
    }

    getDefaultValues() {
        const defaults = {};
        this.properties.forEach((property) => {
            defaults[property.key] = property.defaultValue !== undefined
                ? property.defaultValue
                : this.getDefaultValueByType(property.type);
        });
        return defaults;
    }

    applyValues(nextValues) {
        const merged = {
            ...this.getDefaultValues(),
            ...(nextValues || {})
        };

        const patch = {};
        Object.keys(merged).forEach((key) => {
            if (this.values[key] !== merged[key]) {
                patch[key] = merged[key];
            }
        });

        this.values = merged;

        if (this.onChange && Object.keys(patch).length > 0) {
            this.onChange({ ...this.values }, patch);
        }
    }

    setValues(patch) {
        this.applyValues({
            ...this.values,
            ...(patch || {})
        });
    }

    register() {
        import("../editor/preview/InspectableRegistry").then(({ inspectableRegistry }) => {
            if (this.isDestroyed) {
                return;
            }

            this.registry = inspectableRegistry;
            this.registry.register({
                id: this.id,
                label: this.label,
                type: this.type,
                gameObject: this.gameObject,
                editableLayoutKey: this.id,
                supportsLayout: this.supportsLayout,
                customProperties: this.properties,
                applyCustomValues: (values) => this.applyValues(values)
            });

            this.applyValues(this.values);
            if (this.onChange) {
                this.onChange({ ...this.values }, { ...this.values });
            }
        }).catch(() => {
            // Ignore when editor modules are unavailable in runtime-only mode.
            this.applyValues(this.values);
            if (this.onChange) {
                this.onChange({ ...this.values }, { ...this.values });
            }
        });
    }

    unregister() {
        if (this.registry) {
            this.registry.unregister(this.id);
            this.registry = null;
        }
    }

    destroy() {
        this.isDestroyed = true;
        this.unregister();
    }
}
