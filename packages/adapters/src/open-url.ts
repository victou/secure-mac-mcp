import type { CommandRunner } from "./command.js";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export class OpenUrlAdapter {
  public constructor(private readonly runner: CommandRunner) {}

  public async openUrl(url: string): Promise<void> {
    const parsed = new URL(url);

    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      throw new Error(`Unsupported URL protocol: ${parsed.protocol}`);
    }

    await this.runner.run("open", ["-a", "Safari", parsed.toString()]);
  }
}
