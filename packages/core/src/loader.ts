import { readdir, readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import type { PluginModule } from "../../sdk/src/index.js";
import { parsePluginManifest } from "./manifest.js";
import type { PluginManifest } from "./types.js";

export interface LoadedPlugin {
  manifest: PluginManifest;
  module: PluginModule;
}

export async function loadPlugins(pluginsRoot: string): Promise<LoadedPlugin[]> {
  const entries = await readdir(pluginsRoot, { withFileTypes: true });
  const plugins: LoadedPlugin[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    plugins.push(await loadPlugin(join(pluginsRoot, entry.name)));
  }

  return plugins;
}

export async function loadPlugin(pluginRoot: string): Promise<LoadedPlugin> {
  const manifestPath = join(pluginRoot, "manifest.json");
  const modulePath = join(pluginRoot, "index.ts");
  const manifestContent = await readFile(manifestPath, "utf8");
  const manifest = parsePluginManifest(JSON.parse(manifestContent) as unknown);
  const imported = (await import(pathToFileURL(modulePath).href)) as Partial<PluginModule>;

  if (typeof imported.handle !== "function") {
    throw new Error(`Plugin ${manifest.id} must export a handle function.`);
  }

  return {
    manifest,
    module: {
      handle: imported.handle
    }
  };
}
