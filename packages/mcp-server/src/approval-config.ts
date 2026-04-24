import { resolve } from "node:path";
import { AutoApprovalProvider, DenyByDefaultApprovalProvider } from "../../core/src/index.js";
import type { ApprovalProvider } from "../../sdk/src/index.js";
import { FileApprovalProvider } from "./file-approval-provider.js";

export type ApprovalMode = "deny" | "auto" | "file";

export function createApprovalProvider(mode: string | undefined): ApprovalProvider {
  if (mode === undefined || mode === "" || mode === "deny") {
    return new DenyByDefaultApprovalProvider();
  }

  if (mode === "auto") {
    return new AutoApprovalProvider();
  }

  if (mode === "file") {
    return new FileApprovalProvider({
      rootDir: resolve(
        process.cwd(),
        process.env.SECURE_MAC_MCP_APPROVAL_DIR ?? ".secure-mac-mcp/approvals"
      )
    });
  }

  throw new Error(`Unsupported approval mode: ${mode}`);
}
