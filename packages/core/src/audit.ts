import type { AuditLogger, JsonObject } from "../../sdk/src/index.js";

export class ConsoleAuditLogger implements AuditLogger {
  public info(message: string, data?: JsonObject): void {
    this.write("info", message, data);
  }

  public warn(message: string, data?: JsonObject): void {
    this.write("warn", message, data);
  }

  public error(message: string, data?: JsonObject): void {
    this.write("error", message, data);
  }

  private write(level: "info" | "warn" | "error", message: string, data?: JsonObject): void {
    const record = {
      level,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    process.stderr.write(`${JSON.stringify(record)}\n`);
  }
}
