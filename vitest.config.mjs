import { defineConfig } from 'vitest/config';
import { transformWithOxc } from 'vite';

export default defineConfig({
  plugins: [{ name: 'next-jsx-files', enforce: 'pre', transform(code, id) {
    if (/\/(app|tests)\/.*\.js$/.test(id)) return transformWithOxc(code, id, { lang: 'jsx', jsx: { runtime: 'automatic' } });
  } }],
  test: { include: ['tests/**/*.test.{js,jsx}'], environment: 'jsdom', setupFiles: ['./tests/setup.js'], restoreMocks: true, maxWorkers: 2 },
});
