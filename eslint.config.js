import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import a11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import security from 'eslint-plugin-security';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    languageOptions: { parser: tsparser, parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } }, globals: { console: 'readonly', process: 'readonly', __dirname: 'readonly', module: 'readonly', require: 'readonly', exports: 'readonly', window: 'readonly', document: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', fetch: 'readonly' } },
    plugins: { '@typescript-eslint': tseslint, import: importPlugin, 'jsx-a11y': a11y, react, 'react-hooks': reactHooks, security },
    rules: { ...tseslint.configs.recommended.rules, 'no-undef': 'off', '@typescript-eslint/no-explicit-any': 'error', '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], 'import/no-cycle': 'error', 'import/no-self-import': 'error', 'security/detect-eval-with-expression': 'error', 'security/detect-non-literal-fs-filename': 'error', 'security/detect-non-literal-regexp': 'error', 'security/detect-object-injection': 'warn', 'security/detect-possible-timing-attacks': 'error', 'security/detect-pseudoRandomBytes': 'error', 'react/react-in-jsx-scope': 'off', 'react/display-name': 'off', 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'warn', 'no-dangerously-set-inner-html': 'error' }
  },
  { ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.html', '**/MODELO DE PRUEBA/**', '**/.env*', '**/.husky/**', '.husky/**', '.prettierrc', 'tsconfig*.json', 'vite.config.ts', 'playwright.config.ts', '**/migrations/**', '**/prisma/**'] },
];