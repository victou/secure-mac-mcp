import { describe, expect, it } from "vitest";
import { AutoApprovalProvider, DenyByDefaultApprovalProvider } from "../../core/src/index.js";
import { createApprovalProvider } from "./approval-config.js";

describe("approval config", () => {
  it("uses deny-by-default when no approval mode is configured", () => {
    expect(createApprovalProvider(undefined)).toBeInstanceOf(DenyByDefaultApprovalProvider);
  });

  it("uses auto approval when explicitly configured", () => {
    expect(createApprovalProvider("auto")).toBeInstanceOf(AutoApprovalProvider);
  });

  it("rejects unknown approval modes", () => {
    expect(() => createApprovalProvider("unsafe")).toThrow("Unsupported approval mode");
  });
});
