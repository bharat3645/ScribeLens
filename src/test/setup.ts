import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// React Testing Library doesn't auto-clean between tests unless it detects
// a global `afterEach` (which requires `test.globals: true`). We keep
// globals off and register cleanup explicitly instead, so every test file
// starts from a fresh DOM.
afterEach(() => {
  cleanup();
});
