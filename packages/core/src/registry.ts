import type { RegisteredTool, ToolManifest } from "./types.js";
import type { PluginModule } from "../../sdk/src/index.js";
import { SecureMacMcpError } from "./errors.js";

export class ToolRegistry {
  private readonly tools = new Map<string, RegisteredTool>();

  public register(pluginId: string, manifest: ToolManifest, module: PluginModule): void {
    if (this.tools.has(manifest.name)) {
      throw new SecureMacMcpError(`Duplicate tool registered: ${manifest.name}`, "DUPLICATE_TOOL");
    }

    this.tools.set(manifest.name, {
      pluginId,
      manifest,
      module
    });
  }

  public get(name: string): RegisteredTool {
    const tool = this.tools.get(name);

    if (!tool) {
      throw new SecureMacMcpError(`Unknown tool: ${name}`, "UNKNOWN_TOOL");
    }

    return tool;
  }

  public list(): RegisteredTool[] {
    return Array.from(this.tools.values());
  }
}
