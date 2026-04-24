import type {
  ApprovalDecision,
  ApprovalProvider,
  JsonObject,
  ToolRequest
} from "../../sdk/src/index.js";

export class DenyByDefaultApprovalProvider implements ApprovalProvider {
  public async request(tool: ToolRequest, _input: JsonObject): Promise<ApprovalDecision> {
    return {
      approved: false,
      reason: `Approval is required for ${tool.name}, but no approval provider is configured.`
    };
  }
}

export class AutoApprovalProvider implements ApprovalProvider {
  public async request(tool: ToolRequest, _input: JsonObject): Promise<ApprovalDecision> {
    return {
      approved: true,
      reason: `Automatically approved ${tool.name}.`
    };
  }
}
