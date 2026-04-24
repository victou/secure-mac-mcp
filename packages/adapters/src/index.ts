import type { AdapterContext, JsonObject } from "../../sdk/src/index.js";
import { AppleScriptAdapter } from "./applescript.js";
import { SpawnCommandRunner, type CommandRunner } from "./command.js";
import { OpenUrlAdapter } from "./open-url.js";
import { ShortcutsAdapter } from "./shortcuts.js";

export class MacAdapterContext implements AdapterContext {
  private readonly openUrlAdapter: OpenUrlAdapter;
  private readonly shortcutsAdapter: ShortcutsAdapter;
  private readonly appleScriptAdapter: AppleScriptAdapter;

  public constructor(runner: CommandRunner = new SpawnCommandRunner()) {
    this.openUrlAdapter = new OpenUrlAdapter(runner);
    this.shortcutsAdapter = new ShortcutsAdapter(runner);
    this.appleScriptAdapter = new AppleScriptAdapter();
  }

  public async openUrl(url: string): Promise<void> {
    await this.openUrlAdapter.openUrl(url);
  }

  public async runShortcut(name: string, input: JsonObject): Promise<JsonObject> {
    return this.shortcutsAdapter.runShortcut(name, input);
  }

  public async runAppleScript(scriptId: string, args: JsonObject): Promise<JsonObject> {
    return this.appleScriptAdapter.runAppleScript(scriptId, args);
  }
}

export * from "./applescript.js";
export * from "./command.js";
export * from "./open-url.js";
export * from "./shortcuts.js";
