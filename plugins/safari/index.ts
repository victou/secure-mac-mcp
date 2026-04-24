import type { JsonObject, PluginContext, PluginResult } from "../../packages/sdk/src/index.js";

interface OpenUrlInput {
  url: string;
}

function isOpenUrlInput(input: JsonObject): input is JsonObject & OpenUrlInput {
  return typeof input.url === "string";
}

export async function handle(
  toolName: string,
  input: JsonObject,
  context: PluginContext
): Promise<PluginResult> {
  if (toolName !== "safari.open_url") {
    throw new Error(`Unsupported Safari tool: ${toolName}`);
  }

  if (!isOpenUrlInput(input)) {
    throw new Error("safari.open_url requires a url string.");
  }

  await context.adapters.openUrl(input.url);

  return {
    content: [
      {
        type: "text",
        text: `Opened ${input.url} in Safari.`
      }
    ]
  };
}
