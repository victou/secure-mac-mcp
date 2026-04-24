import { describe, expect, it, vi } from "vitest";
import { OpenUrlAdapter } from "./open-url.js";
import type { CommandRunner } from "./command.js";

describe("OpenUrlAdapter", () => {
  it("opens http URLs through a fixed Safari command without shell execution", async () => {
    const runner: CommandRunner = {
      run: vi.fn(async () => undefined)
    };
    const adapter = new OpenUrlAdapter(runner);

    await adapter.openUrl("https://example.com/path");

    expect(runner.run).toHaveBeenCalledWith("open", ["-a", "Safari", "https://example.com/path"]);
  });

  it("rejects non-http protocols", async () => {
    const runner: CommandRunner = {
      run: vi.fn(async () => undefined)
    };
    const adapter = new OpenUrlAdapter(runner);

    await expect(adapter.openUrl("file:///etc/passwd")).rejects.toThrow("Unsupported URL protocol");
    expect(runner.run).not.toHaveBeenCalled();
  });
});
