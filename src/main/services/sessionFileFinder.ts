import { promises as fs } from "node:fs";
import type { Dirent } from "node:fs";
import path from "node:path";

/** Finds Codex rollout JSONL files that can contain token_count events. */
export class SessionFileFinder {
  private readonly sessionsRoot: string;

  /** Creates a finder rooted at the Codex home directory. */
  constructor(private readonly codexHome: string) {
    this.sessionsRoot = path.join(codexHome, "sessions");
  }

  /** Returns recent session files, using directory dates and mtimes as hints. */
  async findRecentFiles(cutoffMs: number): Promise<string[]> {
    const files: string[] = [];
    await this.walk(this.sessionsRoot, cutoffMs, files);
    return files.sort();
  }

  private async walk(directory: string, cutoffMs: number, files: string[]): Promise<void> {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await this.walk(fullPath, cutoffMs, files);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(".jsonl")) {
        const stats = await fs.stat(fullPath);
        if (stats.mtimeMs >= cutoffMs || this.pathLooksRecent(fullPath, cutoffMs)) {
          files.push(fullPath);
        }
      }
    }
  }

  private pathLooksRecent(filePath: string, cutoffMs: number): boolean {
    const parts = filePath.split(path.sep);
    const year = Number(parts.at(-4));
    const month = Number(parts.at(-3));
    const day = Number(parts.at(-2));
    const dateMs = Date.UTC(year, month - 1, day);
    return Number.isFinite(dateMs) && dateMs >= cutoffMs;
  }
}
