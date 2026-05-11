import { type Page, expect, test } from "@playwright/test";

/**
 * All known application routes.
 * Each route is tested to ensure it renders without errors.
 */
const APP_ROUTES = [
    "/",
    // Dev Tools
    "/dev-tools/base32-converter",
    "/dev-tools/base64-converter",
    "/dev-tools/certificate-viewer",
    "/dev-tools/color-converter",
    "/dev-tools/curl-generator",
    "/dev-tools/hash-generator",
    "/dev-tools/hex-to-binary",
    "/dev-tools/icon-browser",
    "/dev-tools/jwt-decoder",
    "/dev-tools/password-strength-meter",
    "/dev-tools/qr-code-generator",
    "/dev-tools/random-string-generator",
    "/dev-tools/secure-password-generator",
    "/dev-tools/time-converter",
    "/dev-tools/url-encoder-decoder",
    "/dev-tools/uuid-generator",
    // DevOps Tools
    "/devops-tools/cron-expression-builder",
    "/devops-tools/cron-parser",
    "/devops-tools/dockerfile-linter",
    "/devops-tools/env-file-parser",
    "/devops-tools/yaml-json-converter",
    // JSON Tools
    "/json-analyzer",
    "/json-explorer",
    // Markdown Tools
    "/markdown-preview",
    "/markdown-to-html",
    // Networking Tools
    "/networking-tools/cidr-calculator",
    "/networking-tools/juniper-srx-applications",
    "/networking-tools/nmap-command-generator",
    "/networking-tools/shodan-query-builder",
    "/networking-tools/tcpdump-command-generator",
    "/networking-tools/url-builder",
    "/networking-tools/url-explorer",
    "/networking-tools/what-is-my-ip",
    // Text Tools
    "/text-tools/case-converter",
    "/text-tools/lorem-ipsum-generator",
    "/text-tools/to-one-liner",
] as const;

/**
 * API routes to verify they respond correctly.
 */
const API_ROUTES = [
    { path: "/api/ip", expectedStatus: 200 },
    { path: "/up", expectedStatus: 200 },
] as const;

// ---------------------------------------------------------------------------
// Page Smoke Tests
// ---------------------------------------------------------------------------

test.describe("Page Smoke Tests", () => {
    for (const route of APP_ROUTES) {
        test(`renders ${route} without errors`, async ({ page }) => {
            const consoleErrors: string[] = [];

            page.on("console", (msg) => {
                if (msg.type() === "error") {
                    consoleErrors.push(msg.text());
                }
            });

            const response = await page.goto(route, {
                waitUntil: "networkidle",
            });

            // HTTP status must be successful
            expect(response?.status()).toBe(200);

            // Page should have content (not blank)
            const body = page.locator("body");
            await expect(body).not.toBeEmpty();

            // No React/Next.js error overlay should be present
            const errorOverlay = page.locator("#__next-build-error");
            await expect(errorOverlay).toHaveCount(0);

            // No unhandled console errors (filter known benign ones)
            const criticalErrors = consoleErrors.filter(
                (e) =>
                    !e.includes("favicon") &&
                    !e.includes("Download the React DevTools"),
            );
            expect(criticalErrors).toHaveLength(0);
        });
    }
});

// ---------------------------------------------------------------------------
// API Route Tests
// ---------------------------------------------------------------------------

test.describe("API Route Tests", () => {
    for (const { path, expectedStatus } of API_ROUTES) {
        test(`API ${path} responds with ${expectedStatus}`, async ({
            request,
        }) => {
            const response = await request.get(path);
            expect(response.status()).toBe(expectedStatus);
        });
    }
});

// ---------------------------------------------------------------------------
// Network Request Audit (Supply Chain Check)
// ---------------------------------------------------------------------------

/**
 * Allowed external domains. Requests to domains NOT in this list
 * will be logged and cause the test to fail.
 */
const ALLOWED_EXTERNAL_DOMAINS = [
    "localhost",
    "127.0.0.1",
    "plausible.devtoolbox.icu", // https://plausible.devtoolbox.icu/devtoolbox.icu 
                                // public instance for analytics (no personal data collected)
                                // you can view yourself, the dashboard is public
] as const;

test.describe("Network Audit - Supply Chain Check", () => {
    for (const route of APP_ROUTES) {
        test(`test external requests on ${route}`, async ({
            page,
        }) => {
            const unexpectedRequests: string[] = [];

            page.on("request", (req) => {
                const url = new URL(req.url());
                const isAllowed = ALLOWED_EXTERNAL_DOMAINS.some(
                    (domain) => url.hostname === domain,
                );
                if (!isAllowed) {
                    unexpectedRequests.push(
                        `[${req.method()}] ${req.url()} (from ${route})`,
                    );
                }
            });

            await page.goto(route, { waitUntil: "networkidle" });

            if (unexpectedRequests.length > 0) {
                console.warn(
                    `\n⚠️  Unexpected external requests on ${route}:\n${unexpectedRequests.join("\n")}`,
                );
            }

            // Fail if unexpected external requests were made
            expect(
                unexpectedRequests,
                `Unexpected external requests detected on ${route}`,
            ).toHaveLength(0);
        });
    }
});
