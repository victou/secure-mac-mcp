import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createStoredApprovalDecision } from "../../core/src/index.js";
import type { ApprovalRequest } from "../../sdk/src/index.js";

const DEFAULT_APPROVAL_DIR = ".secure-mac-mcp/approvals";

async function main(): Promise<void> {
  const [command, requestId, ...reasonParts] = process.argv.slice(2);
  const rootDir = resolve(
    process.cwd(),
    process.env.SECURE_MAC_MCP_APPROVAL_DIR ?? DEFAULT_APPROVAL_DIR
  );

  if (command === "list") {
    await listPending(rootDir);
    return;
  }

  if (command === "approve" || command === "deny") {
    if (!requestId) {
      throw new Error(`Usage: pnpm approval:${command} <request-id> [reason]`);
    }

    await decide(rootDir, requestId, command === "approve", reasonParts.join(" ") || undefined);
    return;
  }

  throw new Error(
    "Usage: pnpm approval:list | pnpm approval:approve <id> | pnpm approval:deny <id>"
  );
}

async function listPending(rootDir: string): Promise<void> {
  const pendingDir = join(rootDir, "pending");
  await mkdir(pendingDir, { recursive: true });
  const files = (await readdir(pendingDir)).filter((file) => file.endsWith(".json"));

  if (files.length === 0) {
    process.stdout.write("No pending approval requests.\n");
    return;
  }

  for (const file of files) {
    const request = await readApprovalRequest(join(pendingDir, file));
    process.stdout.write(`${request.id}\t${request.tool.name}\t${request.summary}\n`);
  }
}

async function decide(
  rootDir: string,
  requestId: string,
  approved: boolean,
  reason: string | undefined
): Promise<void> {
  const decisionsDir = join(rootDir, "decisions");
  await mkdir(decisionsDir, { recursive: true });
  const decision = createStoredApprovalDecision(requestId, approved, reason);
  await writeFile(
    join(decisionsDir, `${requestId}.json`),
    `${JSON.stringify(decision, null, 2)}\n`,
    "utf8"
  );
  process.stdout.write(`${approved ? "Approved" : "Denied"} ${requestId}\n`);
}

async function readApprovalRequest(path: string): Promise<ApprovalRequest> {
  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw) as ApprovalRequest;

  return parsed;
}

await main();
