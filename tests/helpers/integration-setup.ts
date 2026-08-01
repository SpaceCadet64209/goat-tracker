import { beforeAll } from "vitest";

import { getSafeTestEnvironment } from "./test-environment";

beforeAll(() => {
  getSafeTestEnvironment();
});
