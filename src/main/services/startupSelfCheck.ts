import { promises as fs } from "node:fs";
import type { Dirent } from "node:fs";
import path from "node:path";
import type { StartupSelfCheckSnapshot } from "@shared/tokenTypes";

interface CandidateFile {
  filePath: string;
  mtimeMs: number;
}

/** Detects whether the current machine exposes Codex session token events. */
export class StartupSelfCheck {
  private readonly sessionsRoot: string;

  /** Creates a self-check runner for a Codex home directory. */
  constructor(private readonly codexHome: string) {
    this.sessionsRoot = path.join(codexHome, "sessions");
  }

  /** Runs startup checks using already parsed token event metadata. */
  async run(tokenEventCount: number, tokenEventFileCount: number): Promise<StartupSelfCheckSnapshot> {
    const codexHomeExists = await this.isDirectory(this.codexHome);
    const sessionsDirectoryExists = await this.isDirectory(this.sessionsRoot);
    const files = sessionsDirectoryExists ? await this.collectSessionFiles(this.sessionsRoot) : [];

    return {
      checkedAtMs: Date.now(),
      codexHome: this.codexHome,
      sessionsRoot: this.sessionsRoot,
      codexHomeExists,
      sessionsDirectoryExists,
      sessionFileCount: files.length,
      tokenCountFound: tokenEventCount > 0,
      tokenCountFileCount: tokenEventFileCount,
      tokenCountEventCount: tokenEventCount,
      steps: [
        {
          id: "codexHome",
          label: "Codex 数据目录",
          status: codexHomeExists ? "pass" : "fail",
          detail: codexHomeExists ? this.codexHome : "未找到本机 Codex 数据目录"
        },
        {
          id: "sessions",
          label: "会话日志",
          status: files.length > 0 ? "pass" : "fail",
          detail: files.length > 0 ? `${files.length} 个 session 文件` : "未找到 session 文件"
        },
        {
          id: "tokenCount",
          label: "token_count 事件",
          status: tokenEventCount > 0 ? "pass" : "fail",
          detail:
            tokenEventCount > 0
              ? `${tokenEventCount} 条事件，来自 ${tokenEventFileCount} 个文件`
              : "未找到 token_count 事件"
        }
      ]
    };
  }

  private async isDirectory(directory: string): Promise<boolean> {
    try {
      return (await fs.stat(directory)).isDirectory();
    } catch {
      return false;
    }
  }

  private async collectSessionFiles(directory: string): Promise<CandidateFile[]> {
    const files: CandidateFile[] = [];
    await this.walk(directory, files);
    return files.sort((a, b) => b.mtimeMs - a.mtimeMs);
  }

  private async walk(directory: string, files: CandidateFile[]): Promise<void> {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const filePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await this.walk(filePath, files);
      } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
        const stats = await fs.stat(filePath);
        files.push({ filePath, mtimeMs: stats.mtimeMs });
      }
    }
  }

}
