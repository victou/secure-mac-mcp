export type JsonObject = Record<string, unknown>;

export interface ToolRequest {
  name: string;
  input: JsonObject;
}

export interface ApprovalDecision {
  approved: boolean;
  reason?: string;
}

export interface ApprovalProvider {
  request(tool: ToolRequest, input: JsonObject): Promise<ApprovalDecision>;
}

export interface AuditLogger {
  info(message: string, data?: JsonObject): void;
  warn(message: string, data?: JsonObject): void;
  error(message: string, data?: JsonObject): void;
}

export interface AdapterContext {
  openUrl(url: string): Promise<void>;
  runShortcut(name: string, input: JsonObject): Promise<JsonObject>;
  runAppleScript(scriptId: string, args: JsonObject): Promise<JsonObject>;
}

export interface PluginContext {
  adapters: AdapterContext;
  approval: ApprovalProvider;
  logger: AuditLogger;
}

export interface PluginTextContent {
  type: "text";
  text: string;
}

export interface PluginResult {
  content: PluginTextContent[];
  isError?: boolean;
}

export interface PluginModule {
  handle(toolName: string, input: JsonObject, context: PluginContext): Promise<PluginResult>;
}
