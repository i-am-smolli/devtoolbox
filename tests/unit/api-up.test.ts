import { describe, expect, it } from "vitest";
import { GET } from "@/app/up/route";

/**
 * Tests for the /up health-check route handler.
 */
describe("/up", () => {
  it("returns 200 with status OK", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: "OK" });
  });
});
