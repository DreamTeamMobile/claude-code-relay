/**
 * Utility functions
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { platform } from "node:os";

/**
 * Find executable in PATH (cross-platform which)
 */
export function which(command: string): string | null {
  // If it's an absolute path, check if it exists
  if (command.startsWith("/") || command.startsWith("~")) {
    return existsSync(command) ? command : null;
  }

  try {
    const cmd = platform() === "win32" ? "where" : "which";
    const result = execSync(`${cmd} ${command}`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return result.trim().split("\n")[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Generate a random ID
 */
export function generateId(prefix = ""): string {
  const random = Math.random().toString(36).substring(2, 14);
  return prefix ? `${prefix}-${random}` : random;
}
