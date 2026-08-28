import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only registers its own cleanup when Vitest globals are enabled, and
// they are not: tests import describe/it/expect explicitly. Without this, rendered DOM
// leaks from one test into the next and queries start finding duplicates.
afterEach(() => {
  cleanup();
});
