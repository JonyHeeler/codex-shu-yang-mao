import os from "node:os";
import path from "node:path";

/** Resolves the Codex home directory without reading secret auth files. */
export const resolveCodexHome = (): string => {
  return process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
};

/** Returns the file name without leaking parent directory content. */
export const safeBaseName = (filePath: string): string => path.basename(filePath);
