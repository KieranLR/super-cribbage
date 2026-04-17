// vitest.config.js
import { defineConfig } from 'vitest/config';
import {playwright} from "@vitest/browser-playwright";

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    globals: true,
                    name: 'unit',
                    include: ['tests/**/*.test.js', 'client/tests/**/*.test.js'],
                    exclude: ['tests/browser/**/*.test.js', 'client/tests/browser/**/*.test.js'],
                    environment: 'node',
                },
            },
            {
                test: {
                    globals: true,
                    name: 'browser',
                    include: ['tests/browser/**/*.test.js', 'client/tests/browser/**/*.test.js'],
                    browser: {
                        enabled: true,
                        provider: playwright(),
                        instances: [
                            { browser: 'chromium' },
                        ],
                        headless: true,
                    },
                },
            },
        ],
    },
});