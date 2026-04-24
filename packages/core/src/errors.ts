export class SecureMacMcpError extends Error {
  public constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "SecureMacMcpError";
  }
}
