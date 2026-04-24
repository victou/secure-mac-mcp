import { mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { createStoredApprovalDecision } from "../../core/src/index.js";
import { FileApprovalProvider } from "./file-approval-provider.js";

describe("FileApprovalProvider", () => {
  it("waits for a file decision and returns it", async () => {
    const rootDir = await mkdtemp(join(tmpdir(), "secure-mac-mcp-approvals-"));
    const provider = new FileApprovalProvider({
      rootDir,
      timeoutMs: 1_000,
      pollIntervalMs: 10
    });

    const approvalPromise = provider.request(
      { name: "safari.open_url", input: { url: "https://example.com" } },
      { url: "https://example.com" }
    );

    const requestId = await waitForPendingRequestId(rootDir);
    const decision = createStoredApprovalDecision(requestId, true, "ok");
    await writeJson(join(rootDir, "decisions", `${requestId}.json`), decision);

    await expect(approvalPromise).resolves.toEqual({
      approved: true,
      reason: "ok"
    });
  });

  it("denies when no decision is written before timeout", async () => {
    const rootDir = await mkdtemp(join(tmpdir(), "secure-mac-mcp-approvals-"));
    const provider = new FileApprovalProvider({
      rootDir,
      timeoutMs: 20,
      pollIntervalMs: 5
    });

    await expect(
      provider.request({ name: "safari.open_url", input: {} }, {})
    ).resolves.toMatchObject({
      approved: false,
      reason: "Approval timed out for safari.open_url."
    });
  });
});

async function waitForPendingRequestId(rootDir: string): Promise<string> {
  const pendingDir = join(rootDir, "pending");
  const deadline = Date.now() + 1_000;

  while (Date.now() < deadline) {
    try {
      const files = await readdir(pendingDir);
      const first = files.find((file) => file.endsWith(".json"));

      if (first) {
        const raw = await readFile(join(pendingDir, first), "utf8");
        const parsed = JSON.parse(raw) as { id: string };
        return parsed.id;
      }
    } catch {
      // Directory may not exist yet while the provider is creating it.
    }

    await new Promise((resolve) => setTimeout(resolve, 5));
  }

  throw new Error("Timed out waiting for pending approval request.");
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
