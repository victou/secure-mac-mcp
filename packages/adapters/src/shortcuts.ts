import type { JsonObject } from "../../sdk/src/index.js";
import type { CommandRunner } from "./command.js";

export class ShortcutsAdapter {
  public constructor(private readonly runner: CommandRunner) {}

  public async runShortcut(name: string, input: JsonObject): Promise<JsonObject> {
    if (name.trim().length === 0) {
      throw new Error("Shortcut name is required.");
    }

    await this.runner.run("shortcuts", ["run", name, "--input-path", "-"]);

    return {
      shortcut: name,
      acceptedInput: input
    };
  }
}
