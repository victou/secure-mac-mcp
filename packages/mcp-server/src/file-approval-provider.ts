import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  ApprovalDecision,
  ApprovalProvider,
  ApprovalRequest,
  JsonObject,
  StoredApprovalDecision,
  ToolRequest
} from "../../sdk/src/index.js";
import { createApprovalRequest } from "../../core/src/index.js";

export interface FileApprovalProviderOptions {
  rootDir: string;
  timeoutMs?: number;
  pollIntervalMs?: number;
}

export class FileApprovalProvider implements ApprovalProvider {
  private readonly timeoutMs: number;
  private readonly pollIntervalMs: number;

  public constructor(private readonly options: FileApprovalProviderOptions) {
    this.timeoutMs = options.timeoutMs ?? 60_000;
    this.pollIntervalMs = options.pollIntervalMs ?? 500;
  }

  public async request(tool: ToolRequest, input: JsonObject): Promise<ApprovalDecision> {
    const request = createApprovalRequest(tool, input, { ttlMs: this.timeoutMs });
    await this.ensureDirectories();
    await this.writeRequest(request);

    const decision = await this.waitForDecision(request);
    await this.archiveRequest(request);

    return {
      approved: decision.approved,
      reason: decision.reason
    };
  }

  private get pendingDir(): string {
    return join(this.options.rootDir, "pending");
  }

  private get decisionsDir(): string {
    return join(this.options.rootDir, "decisions");
  }

  private get processedDir(): string {
    return join(this.options.rootDir, "processed");
  }

  private async ensureDirectories(): Promise<void> {
    await mkdir(this.pendingDir, { recursive: true });
    await mkdir(this.decisionsDir, { recursive: true });
    await mkdir(this.processedDir, { recursive: true });
  }

  private async writeRequest(request: ApprovalRequest): Promise<void> {
    await writeJson(join(this.pendingDir, `${request.id}.json`), request);
  }

  private async waitForDecision(request: ApprovalRequest): Promise<StoredApprovalDecision> {
    const deadline = new Date(request.expiresAt).getTime();
    const decisionPath = join(this.decisionsDir, `${request.id}.json`);

    while (Date.now() <= deadline) {
      const decision = await readDecision(decisionPath);

      if (decision) {
        return decision;
      }

      await sleep(this.pollIntervalMs);
    }

    return {
      requestId: request.id,
      approved: false,
      reason: `Approval timed out for ${request.tool.name}.`,
      decidedAt: new Date().toISOString()
    };
  }

  private async archiveRequest(request: ApprovalRequest): Promise<void> {
    const from = join(this.pendingDir, `${request.id}.json`);
    const to = join(this.processedDir, `${request.id}.json`);

    try {
      await rename(from, to);
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        return;
      }

      throw error;
    }
  }
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readDecision(path: string): Promise<StoredApprovalDecision | undefined> {
  try {
    const raw = await readFile(path, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!isStoredApprovalDecision(parsed)) {
      throw new Error(`Invalid approval decision file: ${path}`);
    }

    return parsed;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return undefined;
    }

    throw error;
  }
}

function isStoredApprovalDecision(value: unknown): value is StoredApprovalDecision {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.requestId === "string" &&
    typeof record.approved === "boolean" &&
    typeof record.decidedAt === "string" &&
    (record.reason === undefined || typeof record.reason === "string")
  );
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
