import { AutoApprovalProvider, DenyByDefaultApprovalProvider } from "../../core/src/index.js";
import type { ApprovalProvider } from "../../sdk/src/index.js";

export type ApprovalMode = "deny" | "auto";

export function createApprovalProvider(mode: string | undefined): ApprovalProvider {
  if (mode === undefined || mode === "" || mode === "deny") {
    return new DenyByDefaultApprovalProvider();
  }

  if (mode === "auto") {
    return new AutoApprovalProvider();
  }

  throw new Error(`Unsupported approval mode: ${mode}`);
}
