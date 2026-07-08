import type { NavConfig } from "./config";

const fallbackFontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif";

type FontConfig = NavConfig["fonts"];

function escapeCssString(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

export function getConfiguredFontFamily(fonts: FontConfig): string {
  if (!fonts.family) return fallbackFontFamily;

  return `"${escapeCssString(fonts.family)}", ${fallbackFontFamily}`;
}

export function getConfiguredFontStyle(fonts: FontConfig): string {
  return [
    `--font-body: ${getConfiguredFontFamily(fonts)}`,
    "--font-heading: var(--font-body)",
    `--font-weight-body: ${fonts.weight}`
  ].join("; ");
}
