import type { JsonObject, PluginModule } from "../../sdk/src/index.js";

export type JsonSchema = JsonObject;

export interface ToolManifest {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  requiresApproval: boolean;
}

export interface PluginManifest {
  id: string;
  tools: ToolManifest[];
}

export interface RegisteredTool {
  pluginId: string;
  manifest: ToolManifest;
  module: PluginModule;
}

export interface PolicyResult {
  allowed: boolean;
  reason?: string;
}
