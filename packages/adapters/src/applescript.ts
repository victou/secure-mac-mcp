import type { JsonObject } from "../../sdk/src/index.js";

export class AppleScriptAdapter {
  public async runAppleScript(scriptId: string, args: JsonObject): Promise<JsonObject> {
    throw new Error(
      `AppleScript adapter is not configured for script ${scriptId}. Received args: ${JSON.stringify(args)}`
    );
  }
}
