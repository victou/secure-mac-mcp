import { Ajv } from "ajv";
import type { RegisteredTool } from "./types.js";
import { SecureMacMcpError } from "./errors.js";
import type { ApprovalProvider, AuditLogger, JsonObject } from "../../sdk/src/index.js";

export interface PolicyEngineOptions {
  allowlist: readonly string[];
  approval: ApprovalProvider;
  logger: AuditLogger;
}

export class PolicyEngine {
  private readonly ajv = new Ajv({ allErrors: true, strict: true });
  private readonly allowlist: ReadonlySet<string>;
  private readonly approval: ApprovalProvider;
  private readonly logger: AuditLogger;

  public constructor(options: PolicyEngineOptions) {
    this.allowlist = new Set(options.allowlist);
    this.approval = options.approval;
    this.logger = options.logger;
  }

  public async authorize(tool: RegisteredTool, input: JsonObject): Promise<void> {
    this.validateInput(tool, input);
    this.checkAllowlist(tool);
    await this.requestApprovalIfNeeded(tool, input);
  }

  private validateInput(tool: RegisteredTool, input: JsonObject): void {
    const validate = this.ajv.compile(tool.manifest.inputSchema);
    const valid = validate(input);

    if (!valid) {
      this.logger.warn("Tool input validation failed", {
        toolName: tool.manifest.name,
        errors: validate.errors ?? []
      });
      throw new SecureMacMcpError(`Invalid input for tool: ${tool.manifest.name}`, "INVALID_INPUT");
    }
  }

  private checkAllowlist(tool: RegisteredTool): void {
    if (!this.allowlist.has(tool.manifest.name)) {
      this.logger.warn("Tool rejected by allowlist", { toolName: tool.manifest.name });
      throw new SecureMacMcpError(
        `Tool is not allowlisted: ${tool.manifest.name}`,
        "TOOL_NOT_ALLOWED"
      );
    }
  }

  private async requestApprovalIfNeeded(tool: RegisteredTool, input: JsonObject): Promise<void> {
    if (!tool.manifest.requiresApproval) {
      return;
    }

    const decision = await this.approval.request({ name: tool.manifest.name, input }, input);

    if (!decision.approved) {
      this.logger.warn("Tool approval denied", {
        toolName: tool.manifest.name,
        reason: decision.reason
      });
      throw new SecureMacMcpError(decision.reason ?? "Tool approval denied.", "APPROVAL_DENIED");
    }
  }
}
