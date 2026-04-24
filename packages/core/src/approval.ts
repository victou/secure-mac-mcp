import type {
  ApprovalDecision,
  ApprovalProvider,
  ApprovalRequest,
  JsonObject,
  StoredApprovalDecision,
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

export interface ApprovalRequestOptions {
  now?: Date;
  ttlMs?: number;
  idFactory?: () => string;
}

export function createApprovalRequest(
  tool: ToolRequest,
  input: JsonObject,
  options: ApprovalRequestOptions = {}
): ApprovalRequest {
  const now = options.now ?? new Date();
  const ttlMs = options.ttlMs ?? 60_000;
  const id = options.idFactory?.() ?? crypto.randomUUID();
  const expiresAt = new Date(now.getTime() + ttlMs);

  return {
    id,
    tool,
    input,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    summary: `Approve ${tool.name}`
  };
}

export function createStoredApprovalDecision(
  requestId: string,
  approved: boolean,
  reason: string | undefined,
  now = new Date()
): StoredApprovalDecision {
  return {
    requestId,
    approved,
    reason,
    decidedAt: now.toISOString()
  };
}
