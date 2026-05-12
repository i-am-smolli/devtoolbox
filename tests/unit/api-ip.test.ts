import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/ip/route";

/**
 * Tests for the /api/ip route handler.
 * Validates that the handler correctly extracts the client IP
 * from various request headers without making external calls.
 */
describe("/api/ip", () => {
  function makeRequest(headers: Record<string, string> = {}) {
    return new Request("http://localhost:3000/api/ip", { headers });
  }

  it("returns IP from x-forwarded-for header", async () => {
    const req = makeRequest({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    const res = await GET(req as never);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("1.2.3.4");
  });

  it("returns IP from x-real-ip header", async () => {
    const req = makeRequest({ "x-real-ip": "10.0.0.1" });
    const res = await GET(req as never);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("10.0.0.1");
  });

  it("returns IP from cf-connecting-ip header", async () => {
    const req = makeRequest({ "cf-connecting-ip": "172.16.0.1" });
    const res = await GET(req as never);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("172.16.0.1");
  });

  it("returns 500 when no IP header is present", async () => {
    const req = makeRequest();
    const res = await GET(req as never);
    expect(res.status).toBe(500);
    expect(await res.text()).toBe("Could not determine IP address.");
  });

  it("prefers x-forwarded-for over other headers", async () => {
    const req = makeRequest({
      "x-forwarded-for": "1.1.1.1",
      "x-real-ip": "2.2.2.2",
      "cf-connecting-ip": "3.3.3.3",
    });
    const res = await GET(req as never);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("1.1.1.1");
  });
});
