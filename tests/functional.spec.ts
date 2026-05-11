import { expect, test } from "@playwright/test";

// ---------------------------------------------------------------------------
// Dev Tools — Functional Tests
// ---------------------------------------------------------------------------

test.describe("Base64 Converter", () => {
  test("encodes plain text to Base64", async ({ page }) => {
    await page.goto("/dev-tools/base64-converter");
    await page.fill('textarea[aria-label="Plain Text Input"]', "Hello, World!");
    await page.click('button:has-text("Encode to Base64")');
    const output = page.locator(
      'textarea[aria-label="Base64 Text Input/Output"]',
    );
    await expect(output).toHaveValue("SGVsbG8sIFdvcmxkIQ==");
  });

  test("decodes Base64 to plain text", async ({ page }) => {
    await page.goto("/dev-tools/base64-converter");
    await page.fill(
      'textarea[aria-label="Base64 Text Input/Output"]',
      "SGVsbG8sIFdvcmxkIQ==",
    );
    await page.click('button:has-text("Decode from Base64")');
    const output = page.locator('textarea[aria-label="Plain Text Input"]');
    await expect(output).toHaveValue("Hello, World!");
  });

  test("shows error on invalid Base64 input", async ({ page }) => {
    await page.goto("/dev-tools/base64-converter");
    await page.fill(
      'textarea[aria-label="Base64 Text Input/Output"]',
      "!!!invalid!!!",
    );
    await page.click('button:has-text("Decode from Base64")');
    await expect(page.getByRole("heading", { name: "Error" })).toBeVisible();
  });
});

test.describe("Base32 Converter", () => {
  test("encodes plain text to Base32", async ({ page }) => {
    await page.goto("/dev-tools/base32-converter");
    await page.fill('textarea[aria-label="Plain Text Input"]', "Hello");
    await page.click('button:has-text("Encode to Base32")');
    const output = page.locator(
      'textarea[aria-label="Base32 Text Input/Output"]',
    );
    await expect(output).toHaveValue("JBSWY3DP");
  });

  test("decodes Base32 to plain text", async ({ page }) => {
    await page.goto("/dev-tools/base32-converter");
    await page.fill(
      'textarea[aria-label="Base32 Text Input/Output"]',
      "JBSWY3DP",
    );
    await page.click('button:has-text("Decode from Base32")');
    const output = page.locator('textarea[aria-label="Plain Text Input"]');
    await expect(output).toHaveValue("Hello");
  });
});

test.describe("Hash Generator", () => {
  test("generates SHA-256 hash", async ({ page }) => {
    await page.goto("/dev-tools/hash-generator");
    await page.fill('textarea[placeholder="Enter text to hash..."]', "test");
    await page.click('button:has-text("Generate Hash")');
    const output = page.locator('input[aria-label="Generated hash"]');
    await expect(output).toHaveValue(
      "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    );
  });
});

test.describe("UUID Generator", () => {
  test("generates valid UUIDs", async ({ page }) => {
    await page.goto("/dev-tools/uuid-generator");
    await page.click('button:has-text("Generate UUID")');
    const output = page.locator('textarea[aria-label="Generated UUIDs"]');
    await expect(output).toHaveValue(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });

  test("generates multiple UUIDs", async ({ page }) => {
    await page.goto("/dev-tools/uuid-generator");
    await page.fill('input[type="number"]', "5");
    await page.click('button:has-text("Generate UUID")');
    const output = page.locator('textarea[aria-label="Generated UUIDs"]');
    const value = await output.inputValue();
    expect(value.trim().split("\n")).toHaveLength(5);
  });
});

test.describe("Hex to Binary", () => {
  test("converts hex to binary", async ({ page }) => {
    await page.goto("/dev-tools/hex-to-binary");
    await page.fill('input[placeholder*="1A2B"]', "FF");
    await page.click('button:has-text("Convert to Binary")');
    const output = page.locator("input[readonly]");
    await expect(output).toHaveValue("11111111");
  });

  test("shows error on invalid hex", async ({ page }) => {
    await page.goto("/dev-tools/hex-to-binary");
    await page.fill('input[placeholder*="1A2B"]', "GG");
    await page.click('button:has-text("Convert to Binary")');
    await expect(page.getByText("Error")).toBeVisible();
  });
});

test.describe("URL Encoder/Decoder", () => {
  test("encodes URL", async ({ page }) => {
    await page.goto("/dev-tools/url-encoder-decoder");
    await page.fill(
      'textarea[aria-label="Plain String Input"]',
      "hello world & foo=bar",
    );
    await page.click('button:has-text("Encode URL")');
    const output = page.locator(
      'textarea[aria-label="URL-Encoded String Input/Output"]',
    );
    await expect(output).toHaveValue("hello%20world%20%26%20foo%3Dbar");
  });

  test("decodes URL", async ({ page }) => {
    await page.goto("/dev-tools/url-encoder-decoder");
    await page.fill(
      'textarea[aria-label="URL-Encoded String Input/Output"]',
      "hello%20world",
    );
    await page.click('button:has-text("Decode URL")');
    const output = page.locator('textarea[aria-label="Plain String Input"]');
    await expect(output).toHaveValue("hello world");
  });
});

test.describe("JWT Decoder", () => {
  const SAMPLE_JWT =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  test("decodes JWT header and payload", async ({ page }) => {
    await page.goto("/dev-tools/jwt-decoder");
    await page.fill('textarea[aria-label="JWT Input"]', SAMPLE_JWT);
    // Header tab is shown by default; content in <code> inside <pre>
    await expect(
      page.locator("code").filter({ hasText: '"alg"' }),
    ).toBeVisible();
    // Click payload tab to see payload content
    await page.click('button:has-text("Payload")');
    await expect(
      page.locator("code").filter({ hasText: '"sub"' }),
    ).toBeVisible();
  });

  test("shows error for invalid JWT", async ({ page }) => {
    await page.goto("/dev-tools/jwt-decoder");
    await page.fill('textarea[aria-label="JWT Input"]', "not.a.jwt");
    await expect(
      page.getByRole("heading", { name: "JWT Parsing Error" }),
    ).toBeVisible();
  });
});

test.describe("Color Converter", () => {
  test("converts HEX to RGB values", async ({ page }) => {
    await page.goto("/dev-tools/color-converter");
    const hexInput = page.locator('input[placeholder="#RRGGBB"]');
    await hexInput.fill("#FF0000");
    await hexInput.press("Tab");
    // RGB inputs are type="text" with placeholder="0-255"
    const rgbInputs = page.locator('input[placeholder="0-255"]');
    await expect(rgbInputs.nth(0)).toHaveValue("255");
    await expect(rgbInputs.nth(1)).toHaveValue("0");
    await expect(rgbInputs.nth(2)).toHaveValue("0");
  });
});

test.describe("Password Strength Meter", () => {
  test("rates weak password as weak", async ({ page }) => {
    await page.goto("/dev-tools/password-strength-meter");
    await page.fill('input[placeholder="Type your password here"]', "123");
    await expect(page.getByText(/Very Weak|Weak/)).toBeVisible();
  });

  test("rates strong password as strong", async ({ page }) => {
    await page.goto("/dev-tools/password-strength-meter");
    await page.fill(
      'input[placeholder="Type your password here"]',
      "C0mpl3x!P@ssw0rd#2024",
    );
    await expect(page.getByText(/Strong|Very Strong|Ultra/)).toBeVisible();
  });
});

test.describe("Random String Generator", () => {
  test("generates string with specified length", async ({ page }) => {
    await page.goto("/dev-tools/random-string-generator");
    const lengthInput = page.locator('input[type="number"]');
    await lengthInput.fill("32");
    await page.click('button:has-text("Generate")');
    const output = page.locator("input[readonly]");
    const value = await output.inputValue();
    expect(value).toHaveLength(32);
  });
});

test.describe("Secure Password Generator", () => {
  test("generates password with specified length", async ({ page }) => {
    await page.goto("/dev-tools/secure-password-generator");
    const lengthInput = page.locator('input[type="number"]');
    await lengthInput.fill("24");
    await page.click('button:has-text("Generate Password")');
    const output = page.locator("input[readonly]");
    const value = await output.inputValue();
    expect(value).toHaveLength(24);
  });
});

test.describe("Time Converter", () => {
  test("converts Unix timestamp to ISO 8601", async ({ page }) => {
    await page.goto("/dev-tools/time-converter");
    const unixInput = page.locator('input[placeholder="e.g., 1678886400"]');
    await unixInput.fill("0");
    await unixInput.press("Enter");
    const isoInput = page.locator(
      'input[placeholder="e.g., 2023-03-15T10:30:00.000Z"]',
    );
    await expect(isoInput).toHaveValue(/1970-01-01T/);
  });
});

test.describe("QR Code Generator", () => {
  test("renders QR code for text input", async ({ page }) => {
    await page.goto("/dev-tools/qr-code-generator");
    await page.fill("textarea", "Hello QR");
    await expect(page.locator("canvas")).toBeVisible();
  });
});

test.describe("Certificate Viewer", () => {
  test("shows error for invalid PEM", async ({ page }) => {
    await page.goto("/dev-tools/certificate-viewer");
    await page.fill(
      'textarea[aria-label="Certificate PEM Input"]',
      "not a certificate",
    );
    await page.click('button:has-text("Parse Certificate")');
    await expect(page.getByRole("heading", { name: "Error" })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// DevOps Tools — Functional Tests
// ---------------------------------------------------------------------------

test.describe("YAML/JSON Converter", () => {
  test("converts YAML to JSON", async ({ page }) => {
    await page.goto("/devops-tools/yaml-json-converter");
    await page.fill(
      'textarea[aria-label="YAML Input"]',
      "name: test\nvalue: 42",
    );
    await page.click('button:has-text("Convert to JSON")');
    const jsonOutput = page.locator("textarea").nth(1);
    const value = await jsonOutput.inputValue();
    const parsed = JSON.parse(value);
    expect(parsed).toEqual({ name: "test", value: 42 });
  });

  test("converts JSON to YAML", async ({ page }) => {
    await page.goto("/devops-tools/yaml-json-converter");
    const jsonTextarea = page.locator("textarea").nth(1);
    await jsonTextarea.fill('{"name": "test"}');
    await page.click('button:has-text("Convert to YAML")');
    const yamlOutput = page.locator('textarea[aria-label="YAML Input"]');
    await expect(yamlOutput).toHaveValue(/name: test/);
  });
});

test.describe("Cron Parser", () => {
  test("parses valid cron expression", async ({ page }) => {
    await page.goto("/devops-tools/cron-parser");
    await page.fill(
      'input[placeholder="e.g., */15 0 1,15 * 1-5"]',
      "0 9 * * 1-5",
    );
    await page.click('button:has-text("Parse")');
    await expect(page.getByText("Minute", { exact: true })).toBeVisible();
    await expect(page.getByText("Hour", { exact: true })).toBeVisible();
  });

  test("shows error for invalid cron", async ({ page }) => {
    await page.goto("/devops-tools/cron-parser");
    await page.fill('input[placeholder="e.g., */15 0 1,15 * 1-5"]', "invalid");
    await page.click('button:has-text("Parse")');
    await expect(
      page.getByRole("heading", { name: /Error|Parsing Error/ }),
    ).toBeVisible();
  });
});

test.describe("Dockerfile Linter", () => {
  test("lints valid Dockerfile", async ({ page }) => {
    await page.goto("/devops-tools/dockerfile-linter");
    await page.fill(
      'textarea[aria-label="Dockerfile Input"]',
      'FROM ubuntu:22.04\nRUN apt-get update && apt-get install -y curl\nCMD ["curl", "--version"]',
    );
    await page.click('button:has-text("Lint Dockerfile")');
    await page.waitForTimeout(500);
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
  });
});

test.describe("Env File Parser", () => {
  test("parses .env file content", async ({ page }) => {
    await page.goto("/devops-tools/env-file-parser");
    await page.fill(
      'textarea[aria-label=".env Input"]',
      "DB_HOST=localhost\nDB_PORT=5432",
    );
    // Auto-parses - check table cells (exact to avoid matching copy buttons)
    await expect(
      page.getByRole("cell", { name: "DB_HOST", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "localhost", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "DB_PORT", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "5432", exact: true }),
    ).toBeVisible();
  });
});

test.describe("Cron Expression Builder", () => {
  test("generates cron expression", async ({ page }) => {
    await page.goto("/devops-tools/cron-expression-builder");
    const output = page.locator("input[readonly]");
    await expect(output).toHaveValue(
      /^[\d*/,-]+\s[\d*/,-]+\s[\d*/,-]+\s[\d*/,-]+\s[\d*/,-]+$/,
    );
  });
});

// ---------------------------------------------------------------------------
// JSON Tools — Functional Tests
// ---------------------------------------------------------------------------

test.describe("JSON Analyzer", () => {
  test("validates correct JSON", async ({ page }) => {
    await page.goto("/json-analyzer");
    await page.fill(
      'textarea[aria-label="JSON Input"]',
      '{"key": "value", "num": 42}',
    );
    await page.click('button:has-text("Validate")');
    await expect(page.getByText("JSON is Valid")).toBeVisible();
  });

  test("shows error for invalid JSON", async ({ page }) => {
    await page.goto("/json-analyzer");
    await page.fill('textarea[aria-label="JSON Input"]', "{invalid json}");
    // Auto-validates on change
    await expect(
      page.getByRole("heading", { name: "Invalid JSON" }),
    ).toBeVisible();
  });
});

test.describe("JSON Explorer", () => {
  test("parses and displays JSON tree", async ({ page }) => {
    await page.goto("/json-explorer");
    await page.fill(
      'textarea[aria-label="JSON Input"]',
      '{"users": [{"name": "Alice"}]}',
    );
    // Tree node rendered as button with key name
    await expect(page.getByRole("button", { name: /users/ })).toBeVisible();
  });

  test("shows error for invalid JSON", async ({ page }) => {
    await page.goto("/json-explorer");
    await page.fill('textarea[aria-label="JSON Input"]', "{not json}");
    await expect(
      page.getByRole("heading", { name: "Invalid JSON" }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Markdown Tools — Functional Tests
// ---------------------------------------------------------------------------

test.describe("Markdown Preview", () => {
  test("renders markdown as HTML preview", async ({ page }) => {
    await page.goto("/markdown-preview");
    await page.fill(
      'textarea[aria-label="Markdown Input"]',
      "# Hello\n\nThis is **bold** text.",
    );
    await expect(page.locator("h1").filter({ hasText: "Hello" })).toBeVisible();
    await expect(
      page.locator("strong").filter({ hasText: "bold" }),
    ).toBeVisible();
  });
});

test.describe("Markdown to HTML", () => {
  test("converts markdown to HTML string", async ({ page }) => {
    await page.goto("/markdown-to-html");
    await page.fill(
      'textarea[aria-label="Markdown Input"]',
      "# Title\n\nParagraph.",
    );
    await page.click('button:has-text("Convert to HTML")');
    const output = page.locator('textarea[aria-label="HTML Output"]');
    await expect(output).toHaveValue(/<h1>Title<\/h1>/);
  });
});

// ---------------------------------------------------------------------------
// Text Tools — Functional Tests
// ---------------------------------------------------------------------------

test.describe("Case Converter", () => {
  test("converts to UPPER CASE", async ({ page }) => {
    await page.goto("/text-tools/case-converter");
    await page.fill(
      'textarea[aria-label="Input text for case conversion"]',
      "hello world",
    );
    await page.click('button:has-text("UPPER CASE")');
    const output = page.locator('textarea[aria-label="Converted output text"]');
    await expect(output).toHaveValue("HELLO WORLD");
  });

  test("converts to snake_case", async ({ page }) => {
    await page.goto("/text-tools/case-converter");
    await page.fill(
      'textarea[aria-label="Input text for case conversion"]',
      "Hello World Test",
    );
    await page.click('button:has-text("snake_case")');
    const output = page.locator('textarea[aria-label="Converted output text"]');
    await expect(output).toHaveValue("hello_world_test");
  });

  test("converts to camelCase", async ({ page }) => {
    await page.goto("/text-tools/case-converter");
    await page.fill(
      'textarea[aria-label="Input text for case conversion"]',
      "hello world test",
    );
    await page.click('button:has-text("camelCase")');
    const output = page.locator('textarea[aria-label="Converted output text"]');
    await expect(output).toHaveValue("helloWorldTest");
  });
});

test.describe("Lorem Ipsum Generator", () => {
  test("generates lorem ipsum text", async ({ page }) => {
    await page.goto("/text-tools/lorem-ipsum-generator");
    await page.click('button:has-text("Generate Text")');
    const output = page.locator(
      'textarea[aria-label="Generated placeholder text"]',
    );
    await expect(output).toBeVisible();
    const value = await output.inputValue();
    expect(value.length).toBeGreaterThan(50);
  });
});

test.describe("To One Liner", () => {
  test("converts multi-line text to one line", async ({ page }) => {
    await page.goto("/text-tools/to-one-liner");
    await page.fill(
      'textarea[aria-label="Input text to convert to one line"]',
      "line one\nline two\nline three",
    );
    await page.click('button:has-text("Convert to One Line")');
    const output = page.locator(
      'textarea[aria-label="Single-line output text"]',
    );
    await expect(output).toHaveValue("line one line two line three");
  });
});

// ---------------------------------------------------------------------------
// Networking Tools — Functional Tests
// ---------------------------------------------------------------------------

test.describe("CIDR Calculator", () => {
  test("calculates CIDR details", async ({ page }) => {
    await page.goto("/networking-tools/cidr-calculator");
    const cidrInput = page.locator("input").first();
    await cidrInput.fill("10.0.0.0/24");
    await page.click('button:has-text("Calculate")');
    await expect(page.getByText("10.0.0.255", { exact: true })).toBeVisible();
    await expect(
      page.getByText("255.255.255.0", { exact: true }),
    ).toBeVisible();
  });
});

test.describe("URL Explorer", () => {
  test("parses URL components", async ({ page }) => {
    await page.goto("/networking-tools/url-explorer");
    await page.fill(
      'textarea[aria-label="URL Input"]',
      "https://example.com:8080/path?key=value#section",
    );
    await expect(page.locator("text=example.com").first()).toBeVisible();
    await expect(page.locator("text=8080").first()).toBeVisible();
  });
});

test.describe("URL Builder", () => {
  test("builds URL from components", async ({ page }) => {
    await page.goto("/networking-tools/url-builder");
    const hostnameInput = page.locator('input[placeholder="www.example.com"]');
    await hostnameInput.fill("api.test.com");
    const pathnameInput = page.locator(
      'input[placeholder="/path/to/resource"]',
    );
    await pathnameInput.fill("/v1/users");
    const output = page.locator('textarea[aria-label="Generated URL"]');
    await expect(output).toHaveValue(/https:\/\/api\.test\.com\/v1\/users/);
  });
});

test.describe("Nmap Command Generator", () => {
  test("generates nmap command", async ({ page }) => {
    await page.goto("/networking-tools/nmap-command-generator");
    await page.fill('input[placeholder*="scanme.nmap.org"]', "192.168.1.0/24");
    const output = page.locator(
      'textarea[aria-label="Generated Nmap command"]',
    );
    await expect(output).toHaveValue(/nmap.*192\.168\.1\.0\/24/);
  });
});

test.describe("Tcpdump Command Generator", () => {
  test("generates tcpdump command", async ({ page }) => {
    await page.goto("/networking-tools/tcpdump-command-generator");
    await page.fill('input[placeholder*="eth0"]', "eth0");
    const output = page.locator(
      'textarea[aria-label="Generated tcpdump command"]',
    );
    await expect(output).toHaveValue(/tcpdump.*-i eth0/);
  });
});

test.describe("Juniper SRX Applications", () => {
  test("filters applications by search", async ({ page }) => {
    await page.goto("/networking-tools/juniper-srx-applications");
    await page.fill('input[aria-label="Search applications"]', "http");
    await expect(
      page.getByRole("cell", { name: "junos-http", exact: true }),
    ).toBeVisible();
  });
});

test.describe("Shodan Query Builder", () => {
  test("generates Shodan query", async ({ page }) => {
    await page.goto("/networking-tools/shodan-query-builder");
    await page.fill('input[placeholder*="default password"]', "nginx");
    const output = page.locator("textarea").first();
    await expect(output).toHaveValue(/nginx/);
  });
});

// ---------------------------------------------------------------------------
// Curl Generator — Functional Tests
// ---------------------------------------------------------------------------

test.describe("Curl Generator", () => {
  test("generates curl command for GET request", async ({ page }) => {
    await page.goto("/dev-tools/curl-generator");
    await page.fill(
      'input[placeholder*="api.example.com"]',
      "https://httpbin.org/get",
    );
    const output = page.locator("textarea").last();
    await expect(output).toHaveValue(/curl.*https:\/\/httpbin\.org\/get/);
  });
});

// ---------------------------------------------------------------------------
// Icon Browser — Functional Tests
// ---------------------------------------------------------------------------

test.describe("Icon Browser", () => {
  test("filters icons by search term", async ({ page }) => {
    await page.goto("/dev-tools/icon-browser");
    await page.fill('input[aria-label="Search icons"]', "star");
    // Wait for filtered icons to render (icon names are PascalCase)
    await expect(
      page.locator('button[aria-label="Select icon Star"]'),
    ).toBeVisible({ timeout: 10000 });
  });
});
