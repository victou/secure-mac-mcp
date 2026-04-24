import { resolve } from "node:path";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { MacAdapterContext } from "../../adapters/src/index.js";
import {
  ConsoleAuditLogger,
  DenyByDefaultApprovalProvider,
  PolicyEngine,
  ToolDispatcher,
  ToolRegistry,
  loadPlugins
} from "../../core/src/index.js";
import type { JsonObject, PluginContext, PluginResult } from "../../sdk/src/index.js";

const SERVER_NAME = "secure-mac-mcp";
const SERVER_VERSION = "0.1.0";

function asJsonObject(value: unknown): JsonObject {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function toMcpContent(result: PluginResult): PluginResult["content"] {
  return result.content;
}

export async function createServer(pluginsRoot: string): Promise<Server> {
  const logger = new ConsoleAuditLogger();
  const approval = new DenyByDefaultApprovalProvider();
  const adapters = new MacAdapterContext();
  const context: PluginContext = {
    adapters,
    approval,
    logger
  };
  const registry = new ToolRegistry();
  const plugins = await loadPlugins(pluginsRoot);

  for (const plugin of plugins) {
    for (const tool of plugin.manifest.tools) {
      registry.register(plugin.manifest.id, tool, plugin.module);
    }
  }

  const allowlist = registry.list().map((tool) => tool.manifest.name);
  const policy = new PolicyEngine({ allowlist, approval, logger });
  const dispatcher = new ToolDispatcher(registry, policy, context);
  const server = new Server(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION
    },
    {
      capabilities: {
        tools: {},
        logging: {}
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: registry.list().map((tool) => ({
      name: tool.manifest.name,
      description: tool.manifest.description,
      inputSchema: tool.manifest.inputSchema
    }))
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const result = await dispatcher.dispatch(
      request.params.name,
      asJsonObject(request.params.arguments)
    );

    return {
      content: toMcpContent(result),
      isError: result.isError
    };
  });

  return server;
}

export async function main(): Promise<void> {
  const pluginsRoot = resolve(process.cwd(), "plugins");
  const server = await createServer(pluginsRoot);
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
