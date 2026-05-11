import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './packages/*/tsconfig.json', './packages/frontend/tsconfig.app.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    ignores: [
      'node_modules',
      'dist',
      '**/dist',
      'packages/frontend/public',
      'eslint.config.js',
      'packages/frontend/tailwind.config.js',
      'packages/frontend/vite.config.ts',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  }
);
