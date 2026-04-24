import { describe, expect, it, vi } from "vitest";
import type { PluginContext } from "../../packages/sdk/src/index.js";
import { AutoApprovalProvider } from "../../packages/core/src/index.js";
import { handle } from "./index.js";

describe("safari plugin", () => {
  it("handles safari.open_url through the restricted adapter context", async () => {
    const context: PluginContext = {
      adapters: {
        openUrl: vi.fn(async () => undefined),
        runShortcut: vi.fn(),
        runAppleScript: vi.fn()
      },
      approval: new AutoApprovalProvider(),
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
      }
    };

    await expect(
      handle("safari.open_url", { url: "https://example.com" }, context)
    ).resolves.toEqual({
      content: [{ type: "text", text: "Opened https://example.com in Safari." }]
    });
    expect(context.adapters.openUrl).toHaveBeenCalledWith("https://example.com");
    expect(context.adapters.runShortcut).not.toHaveBeenCalled();
    expect(context.adapters.runAppleScript).not.toHaveBeenCalled();
  });

  it("rejects unsupported Safari tools", async () => {
    const context = {
      adapters: {
        openUrl: vi.fn(),
        runShortcut: vi.fn(),
        runAppleScript: vi.fn()
      },
      approval: new AutoApprovalProvider(),
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
      }
    } satisfies PluginContext;

    await expect(handle("safari.unknown", {}, context)).rejects.toThrow("Unsupported Safari tool");
  });
});
