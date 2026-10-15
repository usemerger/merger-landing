import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
export default [
  { plugins: { 'react-hooks': reactHooks }, linterOptions: { reportUnusedDisableDirectives: 'off' } },
  { ignores: ['node_modules/**', '.next/**', '.vercel/**', 'public/**'] },
  { files: ['app/**/*.{js,jsx}', 'scripts/*.{js,mjs}', 'next.config.js'],
    languageOptions: { ecmaVersion: 'latest', parserOptions: { ecmaFeatures: { jsx: true } }, globals: { ...globals.node, ...globals.browser } },
    rules: { 'constructor-super': 'error', 'no-dupe-args': 'error', 'no-dupe-keys': 'error', 'no-duplicate-case': 'error', 'no-unreachable': 'error', 'valid-typeof': 'error' },
  },
]
