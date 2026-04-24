import { spawn } from "node:child_process";

export interface CommandRunner {
  run(command: string, args: readonly string[]): Promise<void>;
}

export class SpawnCommandRunner implements CommandRunner {
  public async run(command: string, args: readonly string[]): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const child = spawn(command, [...args], {
        shell: false,
        stdio: "ignore"
      });

      child.once("error", reject);
      child.once("exit", (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(new Error(`${command} exited with code ${code ?? "unknown"}.`));
      });
    });
  }
}
