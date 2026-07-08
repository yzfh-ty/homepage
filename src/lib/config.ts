import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { load } from "js-yaml";
import { z } from "zod";

const siteSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  owner: z.string().default(""),
  theme: z.enum(["light", "dark", "system"]).default("system")
});

const profileSchema = z.object({
  title: z.string().default(""),
  subtitle: z.string().default("")
});

const fontsSchema = z.object({
  source: z.enum(["css", "system"]).default("system"),
  cssUrl: z.url().optional(),
  preload: z.boolean().default(false),
  family: z.string().default(""),
  weight: z.coerce.string().default("normal")
});

const iconsSchema = z.object({
  mode: z.enum(["manual", "favicon"]).default("manual"),
  defaultIcon: z.string().default("fas fa-link"),
  timeoutMs: z.coerce.number().int().min(300).max(15000).default(2500)
});

const siteItemSchema = z.object({
  name: z.string().min(1),
  url: z.url(),
  description: z.string().default(""),
  icon: z.string().optional(),
  tags: z.array(z.string()).default([])
});

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  icon: z.string().default("fas fa-folder"),
  sites: z.array(siteItemSchema).default([])
});

const siteConfigSchema = z.object({
  site: siteSchema,
  profile: profileSchema.default({ title: "", subtitle: "" }),
  fonts: fontsSchema.default({
    source: "system",
    preload: false,
    family: "",
    weight: "normal"
  }),
  icons: iconsSchema.default({ mode: "manual", defaultIcon: "fas fa-link", timeoutMs: 2500 })
});

const pageConfigSchema = z.object({
  categories: z.array(categorySchema).default([])
});

const navConfigSchema = siteConfigSchema.extend(pageConfigSchema.shape);

export type NavConfig = z.infer<typeof navConfigSchema>;
export type SiteItem = z.infer<typeof siteItemSchema>;
export type Category = z.infer<typeof categorySchema>;
export type IconMode = z.infer<typeof iconsSchema>["mode"];

const defaultSettingsPath = "src/defaults/settings.yml";
const defaultNavigationPath = "src/defaults/navigation.yml";

function loadYamlFile(path: string): unknown {
  const file = readFileSync(path, "utf8");
  return load(file);
}

function ensureYamlFile(path: string, fallbackPath: string): string {
  if (existsSync(path)) return path;

  mkdirSync(dirname(path), { recursive: true });
  copyFileSync(fallbackPath, path);
  return path;
}

export function loadNavConfig(): NavConfig {
  const pageConfigPath = resolve(process.env.NAV_NAVIGATION_CONFIG ?? "config/navigation.yml");
  const siteConfigPath = resolve(process.env.NAV_SETTINGS_CONFIG ?? "config/settings.yml");
  const pageRaw = loadYamlFile(ensureYamlFile(pageConfigPath, resolve(defaultNavigationPath)));
  const siteRaw = loadYamlFile(ensureYamlFile(siteConfigPath, resolve(defaultSettingsPath)));
  const siteConfig = siteConfigSchema.parse(siteRaw);
  const pageConfig = pageConfigSchema.parse(pageRaw);

  return navConfigSchema.parse({
    ...siteConfig,
    ...pageConfig
  });
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function getFaviconUrls(url: string): string[] {
  try {
    const origin = new URL(url).origin;
    const target = encodeURIComponent(url);
    return [
      `${origin}/favicon.ico`,
      `${origin}/favicon.svg`,
      `${origin}/apple-touch-icon.png`,
      `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${target}&size=32&drop_404_icon=true`,
      `https://t3.gstatic.cn/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${target}&size=32&drop_404_icon=true`
    ];
  } catch {
    return [];
  }
}
