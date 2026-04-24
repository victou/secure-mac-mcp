import type { PluginContext, PluginResult, JsonObject } from "../../sdk/src/index.js";
import type { PolicyEngine } from "./policy.js";
import type { ToolRegistry } from "./registry.js";

export class ToolDispatcher {
  public constructor(
    private readonly registry: ToolRegistry,
    private readonly policy: PolicyEngine,
    private readonly context: PluginContext
  ) {}

  public async dispatch(toolName: string, input: JsonObject): Promise<PluginResult> {
    const tool = this.registry.get(toolName);

    this.context.logger.info("Tool requested", { toolName });
    await this.policy.authorize(tool, input);
    const result = await tool.module.handle(toolName, input, this.context);
    this.context.logger.info("Tool executed", { toolName });

    return result;
  }
}
