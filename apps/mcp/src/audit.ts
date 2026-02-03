/**
 * Audit Logger
 *
 * Logs all secret access by AI agents for security and compliance.
 * This is crucial - you need to know what your AI agents are accessing.
 */

import { appendFileSync, existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join, dirname } from "path";

interface AuditEntry {
  timestamp: string;
  action: string;
  details: Record<string, unknown>;
  pid: number;
  ppid: number;
}

export class AuditLogger {
  private logPath: string;

  constructor(logPath?: string) {
    this.logPath = logPath || join(homedir(), ".envvault", "audit.log");

    // Ensure directory exists
    const dir = dirname(this.logPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  log(action: string, details: Record<string, unknown>): void {
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      pid: process.pid,
      ppid: process.ppid || 0,
    };

    const line = JSON.stringify(entry) + "\n";

    try {
      appendFileSync(this.logPath, line);
    } catch (error) {
      // Don't fail if we can't write audit log
      console.error("Failed to write audit log:", error);
    }

    // Also log to stderr for visibility
    console.error(`[AUDIT] ${action}:`, JSON.stringify(details));
  }
}
