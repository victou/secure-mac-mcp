import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { loadPlugin, loadPlugins } from "./loader.js";

async function createPlugin(root: string, name: string, indexSource: string): Promise<string> {
  const pluginRoot = join(root, name);
  await mkdir(pluginRoot, { recursive: true });
  await writeFile(
    join(pluginRoot, "manifest.json"),
    JSON.stringify({
      id: name,
      tools: [
        {
          name: `${name}.tool`,
          description: "Tool",
          inputSchema: { type: "object", properties: {} },
          requiresApproval: false
        }
      ]
    })
  );
  await writeFile(join(pluginRoot, "index.ts"), indexSource);
  return pluginRoot;
}

describe("plugin loader", () => {
  it("loads a plugin manifest and handler", async () => {
    const root = await mkdtemp(join(tmpdir(), "secure-mac-mcp-"));
    await createPlugin(
      root,
      "sample",
      "export async function handle() { return { content: [{ type: 'text', text: 'ok' }] }; }"
    );

    const plugins = await loadPlugins(root);

    expect(plugins).toHaveLength(1);
    expect(plugins[0]?.manifest.id).toBe("sample");
    expect(plugins[0]?.manifest.tools[0]?.name).toBe("sample.tool");
    expect(typeof plugins[0]?.module.handle).toBe("function");
  });

  it("rejects invalid manifests", async () => {
    const root = await mkdtemp(join(tmpdir(), "secure-mac-mcp-"));
    const pluginRoot = join(root, "invalid");
    await mkdir(pluginRoot, { recursive: true });
    await writeFile(join(pluginRoot, "manifest.json"), JSON.stringify({ id: "invalid" }));
    await writeFile(join(pluginRoot, "index.ts"), "export async function handle() { return {}; }");

    await expect(loadPlugin(pluginRoot)).rejects.toThrow("tools must be an array");
  });

  it("rejects plugins without a handler", async () => {
    const root = await mkdtemp(join(tmpdir(), "secure-mac-mcp-"));
    const pluginRoot = await createPlugin(root, "missing", "export const value = 1;");

    await expect(loadPlugin(pluginRoot)).rejects.toThrow("must export a handle function");
  });
});
