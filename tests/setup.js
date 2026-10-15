import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
// The WebGL artwork has its own interaction tests. Auth tests exercise forms.
vi.mock('../app/components/MergeHero', () => ({default: () => null}));
afterEach(cleanup);
