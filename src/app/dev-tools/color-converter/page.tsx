"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Palette, AlertCircle } from "lucide-react";

// Conversion Functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(
    shorthandRegex,
    (_m, r_val, g_val, b_val) => r_val + r_val + g_val + g_val + b_val + b_val,
  );
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  const componentToHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s: number;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s, l: l };
}

function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  let r_val: number, g_val: number, b_val: number;
  h /= 360; // Convert h to 0-1 range

  if (s === 0) {
    r_val = g_val = b_val = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r_val = hue2rgb(p, q, h + 1 / 3);
    g_val = hue2rgb(p, q, h);
    b_val = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r_val * 255),
    g: Math.round(g_val * 255),
    b: Math.round(b_val * 255),
  };
}

export default function ColorConverterPage() {
  const [hex, setHex] = useState<string>("#4285F4");
  const [r, setR] = useState<string>("66");
  const [g, setG] = useState<string>("133");
  const [b, setB] = useState<string>("244");
  const [h, setH] = useState<string>("217");
  const [s, setS] = useState<string>("90");
  const [l, setL] = useState<string>("61");

  const [colorPreview, setColorPreview] = useState<string>("#4285F4");
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [activeInput, setActiveInput] = useState<"hex" | "rgb" | "hsl" | null>(
    null,
  );

  const updatePreview = useCallback(
    (rVal: number, gVal: number, bVal: number) => {
      if (
        !Number.isNaN(rVal) &&
        !Number.isNaN(gVal) &&
        !Number.isNaN(bVal) &&
        rVal >= 0 &&
        rVal <= 255 &&
        gVal >= 0 &&
        gVal <= 255 &&
        bVal >= 0 &&
        bVal <= 255
      ) {
        setColorPreview(`rgb(${rVal}, ${gVal}, ${bVal})`);
      }
    },
    [],
  );

  const handleHexChange = useCallback((newHex: string) => {
    setHex(newHex);
    setActiveInput("hex");
  }, []);

  const handleRgbChange = useCallback(
    (newR: string, newG: string, newB: string) => {
      setR(newR);
      setG(newG);
      setB(newB);
      setActiveInput("rgb");
    },
    [],
  );

  const handleHslChange = useCallback(
    (newH: string, newS: string, newL: string) => {
      setH(newH);
      setS(newS);
      setL(newL);
      setActiveInput("hsl");
    },
    [],
  );

  useEffect(() => {
    setIsClient(true);
    // Initial conversion from default HEX
    const initialRgb = hexToRgb("#4285F4");
    if (initialRgb) {
      updatePreview(initialRgb.r, initialRgb.g, initialRgb.b);
      const initialHsl = rgbToHsl(initialRgb.r, initialRgb.g, initialRgb.b);
      setR(String(initialRgb.r));
      setG(String(initialRgb.g));
      setB(String(initialRgb.b));
      setH(String(Math.round(initialHsl.h)));
      setS(String(Math.round(initialHsl.s * 100)));
      setL(String(Math.round(initialHsl.l * 100)));
    }
  }, [updatePreview]);

  useEffect(() => {
    if (!isClient) return;
    setError(null);

    if (activeInput === "hex") {
      const rgbResult = hexToRgb(hex);
      if (rgbResult) {
        setR(String(rgbResult.r));
        setG(String(rgbResult.g));
        setB(String(rgbResult.b));
        updatePreview(rgbResult.r, rgbResult.g, rgbResult.b);
        const hslResult = rgbToHsl(rgbResult.r, rgbResult.g, rgbResult.b);
        setH(String(Math.round(hslResult.h)));
        setS(String(Math.round(hslResult.s * 100)));
        setL(String(Math.round(hslResult.l * 100)));
      } else if (hex.trim() !== "" && hex.trim() !== "#") {
        setError("Invalid HEX. Format: #RRGGBB or #RGB.");
      }
    } else if (activeInput === "rgb") {
      const rNum = parseInt(r, 10);
      const gNum = parseInt(g, 10);
      const bNum = parseInt(b, 10);

      if (
        Number.
        isNaN(rNum) ||
        Number.
        isNaN(gNum) ||
        Number.
        isNaN(bNum) ||
        rNum < 0 ||
        rNum > 255 ||
        gNum < 0 ||
        gNum > 255 ||
        bNum < 0 ||
        bNum > 255
      ) {
        if (r.trim() !== "" || g.trim() !== "" || b.trim() !== "") {
          setError("Invalid RGB. Each value must be 0-255.");
        }
        return;
      }
      updatePreview(rNum, gNum, bNum);
      setHex(rgbToHex(rNum, gNum, bNum));
      const hslResult = rgbToHsl(rNum, gNum, bNum);
      setH(String(Math.round(hslResult.h)));
      setS(String(Math.round(hslResult.s * 100)));
      setL(String(Math.round(hslResult.l * 100)));
    } else if (activeInput === "hsl") {
      const hNum = parseInt(h, 10);
      const sNum = parseInt(s, 10);
      const lNum = parseInt(l, 10);

      if (
        Number.
        isNaN(hNum) ||
        Number.
        isNaN(sNum) ||
        Number.
        isNaN(lNum) ||
        hNum < 0 ||
        hNum > 360 ||
        sNum < 0 ||
        sNum > 100 ||
        lNum < 0 ||
        lNum > 100
      ) {
        if (h.trim() !== "" || s.trim() !== "" || l.trim() !== "") {
          setError("Invalid HSL. H: 0-360, S: 0-100, L: 0-100.");
        }
        return;
      }
      const rgbResult = hslToRgb(hNum, sNum / 100, lNum / 100);
      setR(String(rgbResult.r));
      setG(String(rgbResult.g));
      setB(String(rgbResult.b));
      updatePreview(rgbResult.r, rgbResult.g, rgbResult.b);
      setHex(rgbToHex(rgbResult.r, rgbResult.g, rgbResult.b));
    }
  }, [hex, r, g, b, h, s, l, activeInput, isClient, updatePreview]);

  return (
    <div>
      <PageHeader
        title="Color Converter"
        description="Convert colors between HEX, RGB, and HSL formats."
        icon={Palette}
      />
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-headline">Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {isClient && (
            <div
              className="h-24 w-full rounded-md border transition-colors duration-300"
              style={{ backgroundColor: error ? "transparent" : colorPreview }}
            />
          )}

          {isClient && error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {/* HEX Input */}
            <div className="space-y-2">
              <Label htmlFor="hexInput" className="text-lg font-semibold">
                HEX
              </Label>
              <Input
                id="hexInput"
                type="text"
                placeholder="#RRGGBB"
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                onFocus={() => setActiveInput("hex")}
                className="font-code text-base"
              />
            </div>

            {/* RGB Inputs */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">RGB</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label
                    htmlFor="rgbRInput"
                    className="text-xs text-muted-foreground"
                  >
                    Red
                  </Label>
                  <Input
                    id="rgbRInput"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0-255"
                    value={r}
                    onChange={(e) => handleRgbChange(e.target.value, g, b)}
                    onFocus={() => setActiveInput("rgb")}
                    className="font-code text-base"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="rgbGInput"
                    className="text-xs text-muted-foreground"
                  >
                    Green
                  </Label>
                  <Input
                    id="rgbGInput"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0-255"
                    value={g}
                    onChange={(e) => handleRgbChange(r, e.target.value, b)}
                    onFocus={() => setActiveInput("rgb")}
                    className="font-code text-base"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="rgbBInput"
                    className="text-xs text-muted-foreground"
                  >
                    Blue
                  </Label>
                  <Input
                    id="rgbBInput"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0-255"
                    value={b}
                    onChange={(e) => handleRgbChange(r, g, e.target.value)}
                    onFocus={() => setActiveInput("rgb")}
                    className="font-code text-base"
                  />
                </div>
              </div>
            </div>

            {/* HSL Inputs */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">HSL</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label
                    htmlFor="hslHInput"
                    className="text-xs text-muted-foreground"
                  >
                    Hue (°)
                  </Label>
                  <Input
                    id="hslHInput"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0-360"
                    value={h}
                    onChange={(e) => handleHslChange(e.target.value, s, l)}
                    onFocus={() => setActiveInput("hsl")}
                    className="font-code text-base"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="hslSInput"
                    className="text-xs text-muted-foreground"
                  >
                    Saturation (%)
                  </Label>
                  <Input
                    id="hslSInput"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0-100"
                    value={s}
                    onChange={(e) => handleHslChange(h, e.target.value, l)}
                    onFocus={() => setActiveInput("hsl")}
                    className="font-code text-base"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="hslLInput"
                    className="text-xs text-muted-foreground"
                  >
                    Lightness (%)
                  </Label>
                  <Input
                    id="hslLInput"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0-100"
                    value={l}
                    onChange={(e) => handleHslChange(h, s, e.target.value)}
                    onFocus={() => setActiveInput("hsl")}
                    className="font-code text-base"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
