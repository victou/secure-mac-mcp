import { describe, expect, it, vi } from "vitest";
import type { AuditLogger, PluginContext } from "../../sdk/src/index.js";
import { AutoApprovalProvider } from "./approval.js";
import { ToolDispatcher } from "./dispatcher.js";
import { PolicyEngine } from "./policy.js";
import { ToolRegistry } from "./registry.js";

const logger: AuditLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

describe("ToolDispatcher", () => {
  it("dispatches to the registered handler after policy authorization", async () => {
    const registry = new ToolRegistry();
    const handle = vi.fn(async () => ({ content: [{ type: "text" as const, text: "done" }] }));
    const context: PluginContext = {
      adapters: {
        openUrl: vi.fn(),
        runShortcut: vi.fn(),
        runAppleScript: vi.fn()
      },
      approval: new AutoApprovalProvider(),
      logger
    };

    registry.register(
      "test",
      {
        name: "test.tool",
        description: "Test tool",
        requiresApproval: false,
        inputSchema: {
          type: "object",
          additionalProperties: false,
          properties: {}
        }
      },
      { handle }
    );

    const policy = new PolicyEngine({
      allowlist: ["test.tool"],
      approval: context.approval,
      logger
    });
    const dispatcher = new ToolDispatcher(registry, policy, context);

    await expect(dispatcher.dispatch("test.tool", {})).resolves.toEqual({
      content: [{ type: "text", text: "done" }]
    });
    expect(handle).toHaveBeenCalledWith("test.tool", {}, context);
  });
});
