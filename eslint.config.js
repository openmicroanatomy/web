import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    prettier,
    {
        rules: {
            "@typescript-eslint/ban-ts-comment": [ "error", { "ts-ignore": "allow-with-description" } ],
            "@typescript-eslint/no-unused-vars": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/explicit-module-boundary-types": "off"
        }
    }
);
