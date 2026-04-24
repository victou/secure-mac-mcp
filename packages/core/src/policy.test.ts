import { describe, expect, it, vi } from "vitest";
import type { AuditLogger, PluginModule } from "../../sdk/src/index.js";
import { AutoApprovalProvider, DenyByDefaultApprovalProvider } from "./approval.js";
import { SecureMacMcpError } from "./errors.js";
import { PolicyEngine } from "./policy.js";
import type { RegisteredTool } from "./types.js";

const logger: AuditLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

const module: PluginModule = {
  async handle() {
    return { content: [{ type: "text", text: "ok" }] };
  }
};

function tool(overrides: Partial<RegisteredTool["manifest"]> = {}): RegisteredTool {
  return {
    pluginId: "test",
    module,
    manifest: {
      name: "test.tool",
      description: "Test tool",
      requiresApproval: false,
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["value"],
        properties: {
          value: { type: "string" }
        }
      },
      ...overrides
    }
  };
}

describe("PolicyEngine", () => {
  it("accepts valid input for an allowlisted tool that does not require approval", async () => {
    const policy = new PolicyEngine({
      allowlist: ["test.tool"],
      approval: new DenyByDefaultApprovalProvider(),
      logger
    });

    await expect(policy.authorize(tool(), { value: "hello" })).resolves.toBeUndefined();
  });

  it("rejects invalid input before execution", async () => {
    const policy = new PolicyEngine({
      allowlist: ["test.tool"],
      approval: new AutoApprovalProvider(),
      logger
    });

    await expect(policy.authorize(tool(), { value: 123 })).rejects.toMatchObject({
      code: "INVALID_INPUT"
    } satisfies Partial<SecureMacMcpError>);
  });

  it("rejects tools that are not allowlisted", async () => {
    const policy = new PolicyEngine({
      allowlist: [],
      approval: new AutoApprovalProvider(),
      logger
    });

    await expect(policy.authorize(tool(), { value: "hello" })).rejects.toMatchObject({
      code: "TOOL_NOT_ALLOWED"
    } satisfies Partial<SecureMacMcpError>);
  });

  it("denies approval by default for approval-gated tools", async () => {
    const policy = new PolicyEngine({
      allowlist: ["test.tool"],
      approval: new DenyByDefaultApprovalProvider(),
      logger
    });

    await expect(
      policy.authorize(tool({ requiresApproval: true }), { value: "hello" })
    ).rejects.toMatchObject({
      code: "APPROVAL_DENIED"
    } satisfies Partial<SecureMacMcpError>);
  });
});
