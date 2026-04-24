import type { PluginManifest } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parsePluginManifest(raw: unknown): PluginManifest {
  if (!isRecord(raw)) {
    throw new Error("Plugin manifest must be an object.");
  }

  if (typeof raw.id !== "string" || raw.id.length === 0) {
    throw new Error("Plugin manifest id must be a non-empty string.");
  }

  if (!Array.isArray(raw.tools)) {
    throw new Error("Plugin manifest tools must be an array.");
  }

  return {
    id: raw.id,
    tools: raw.tools.map((tool, index) => {
      if (!isRecord(tool)) {
        throw new Error(`Tool manifest at index ${index} must be an object.`);
      }

      if (typeof tool.name !== "string" || tool.name.length === 0) {
        throw new Error(`Tool manifest at index ${index} must have a non-empty name.`);
      }

      if (typeof tool.description !== "string" || tool.description.length === 0) {
        throw new Error(`Tool manifest ${tool.name} must have a non-empty description.`);
      }

      if (!isRecord(tool.inputSchema)) {
        throw new Error(`Tool manifest ${tool.name} must have an inputSchema object.`);
      }

      if (typeof tool.requiresApproval !== "boolean") {
        throw new Error(`Tool manifest ${tool.name} must have a boolean requiresApproval.`);
      }

      return {
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        requiresApproval: tool.requiresApproval
      };
    })
  };
}
