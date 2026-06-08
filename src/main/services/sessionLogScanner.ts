import { promises as fs } from "node:fs";
import type { TokenEvent } from "@shared/tokenTypes";
import { parseIsoMs } from "../utils/dateUtils";
import { normalizeRateLimits, normalizeUsage } from "./tokenNormalizer";
import { SessionFileFinder } from "./sessionFileFinder";

interface FileCursor {
  offset: number;
  lineNumber: number;
  carry: string;
}

/** Incrementally scans Codex rollout JSONL files for token_count events. */
export class SessionLogScanner {
  private readonly cursors = new Map<string, FileCursor>();

  /** Creates a scanner with a pluggable session file finder. */
  constructor(private readonly finder: SessionFileFinder) {}

  /** Reads newly appended JSONL lines and returns parsed token events. */
  async scan(cutoffMs: number): Promise<TokenEvent[]> {
    const files = await this.finder.findRecentFiles(cutoffMs);
    const events: TokenEvent[] = [];

    for (const file of files) {
      const parsed = await this.scanFile(file);
      events.push(...parsed.filter((event) => event.timestampMs >= cutoffMs));
    }

    return events;
  }

  private async scanFile(filePath: string): Promise<TokenEvent[]> {
    const stats = await fs.stat(filePath);
    const existing = this.cursors.get(filePath);
    const cursor = existing && existing.offset <= stats.size ? existing : this.emptyCursor();

    if (stats.size === cursor.offset) {
      return [];
    }

    const chunk = await this.readChunk(filePath, cursor.offset, stats.size);
    const combined = cursor.carry + chunk;
    const complete = combined.endsWith("\n") || combined.endsWith("\r");
    const lines = combined.split(/\r?\n/);
    const carry = complete ? "" : lines.pop() ?? "";
    const events = this.parseLines(filePath, lines, cursor.lineNumber);

    this.cursors.set(filePath, {
      offset: stats.size,
      lineNumber: cursor.lineNumber + lines.length,
      carry
    });
    return events;
  }

  private emptyCursor(): FileCursor {
    return { offset: 0, lineNumber: 0, carry: "" };
  }

  private async readChunk(filePath: string, start: number, end: number): Promise<string> {
    const handle = await fs.open(filePath, "r");
    try {
      const buffer = Buffer.alloc(end - start);
      await handle.read(buffer, 0, buffer.length, start);
      return buffer.toString("utf8");
    } finally {
      await handle.close();
    }
  }

  private parseLines(filePath: string, lines: string[], baseLine: number): TokenEvent[] {
    return lines.flatMap((line, index) => {
      const event = this.parseLine(filePath, baseLine + index + 1, line);
      return event ? [event] : [];
    });
  }

  private parseLine(filePath: string, lineNumber: number, line: string): TokenEvent | null {
    if (!line.includes("\"token_count\"")) {
      return null;
    }

    try {
      const parsed = JSON.parse(line) as Record<string, unknown>;
      const payload = parsed.payload as Record<string, unknown> | undefined;
      if (parsed.type !== "event_msg" || payload?.type !== "token_count") {
        return null;
      }

      const timestampMs = parseIsoMs(parsed.timestamp);
      const info = payload.info as Record<string, unknown> | undefined;
      if (!timestampMs || !info) {
        return null;
      }

      return {
        id: `${filePath}:${lineNumber}`,
        timestampMs,
        usage: normalizeUsage(info.last_token_usage as Record<string, unknown>),
        totalUsage: normalizeUsage(info.total_token_usage as Record<string, unknown>),
        modelContextWindow:
          typeof info.model_context_window === "number" ? info.model_context_window : null,
        rateLimits: normalizeRateLimits(payload.rate_limits as Record<string, unknown>, timestampMs),
        sourceFile: filePath
      };
    } catch {
      return null;
    }
  }
}
