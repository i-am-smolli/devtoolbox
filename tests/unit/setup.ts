import nock from "nock";
import { afterEach, beforeAll } from "vitest";

/**
 * Global test setup: block ALL outgoing HTTP requests that are not
 * explicitly mocked with nock. This ensures no test can accidentally
 * reach the real internet.
 */
beforeAll(() => {
  nock.disableNetConnect();
  // Allow localhost for any in-process servers
  //nock.enableNetConnect("127.0.0.1");
});

afterEach(() => {
  nock.cleanAll();
});
