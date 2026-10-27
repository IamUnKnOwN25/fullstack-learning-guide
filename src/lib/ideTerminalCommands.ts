import { IdeFile } from "./ideBundler";

export interface TerminalCommandContext {
  files: IdeFile[];
}

export interface TerminalCommandResult {
  output?: string[];
  clear?: boolean;
  handled: boolean;
}

export const KNOWN_COMMANDS = [
  "help",
  "ls",
  "cat",
  "node",
  "run",
  "drill",
  "touch",
  "rm",
  "export",
  "import",
  "clear",
  "cls",
  "pwd",
  "whoami",
  "echo",
  "wc",
];

export function executeTerminalCommand(
  rawInput: string,
  context: TerminalCommandContext
): TerminalCommandResult {
  if (typeof rawInput !== "string") return { handled: false };
  const trimmed = rawInput.trim();
  if (!trimmed) return { handled: false };

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts[1];
  const rest = trimmed.substring(parts[0].length).trim();
  const safeFiles = Array.isArray(context?.files) ? context.files : [];

  if (cmd === "help" || cmd === "man") {
    if (arg) {
      const sub = arg.toLowerCase();
      const manuals: Record<string, string> = {
        ls: "ls - List all files in the active workspace with byte sizes",
        cat: "cat <filename> - Print entire content of a virtual file",
        clear: "clear / cls - Reset the terminal scrollback buffer",
        cls: "cls - Alias for clear",
        echo: "echo <text> - Print arguments to the terminal",
        wc: "wc <filename> - Count lines, words, and characters in a file",
        pwd: "pwd - Print current working directory",
        whoami: "whoami - Display active matrix operator handle",
      };
      if (manuals[sub]) {
        return { handled: true, output: [manuals[sub]] };
      }
    }
    return {
      handled: true,
      output: [
        "Available matrix-sh commands:",
        "  ls                 List all files in workspace",
        "  cat <filename>     Print file contents",
        "  node <filename>    Execute JS/TS file and print console output",
        "  run                Bundle & refresh live preview",
        "  drill <realm>      Load beginner warm-up drill into workspace",
        "  touch <filename>   Create a new file in workspace",
        "  rm <filename>      Remove a file from workspace",
        "  export             Export entire workspace bundle as JSON",
        "  import             Import workspace JSON bundle from disk",
        "  clear              Clear terminal output",
        "  whoami             Display current operator status",
        "  echo <text>        Print text to terminal",
        "  wc <filename>      Count lines, words, and characters in a file",
      ],
    };
  } else if (cmd === "clear" || cmd === "cls") {
    return { handled: true, clear: true };
  } else if (cmd === "pwd") {
    return { handled: true, output: ["/workspace (virtual dev environment)"] };
  } else if (cmd === "ls") {
    const out = safeFiles.map((f) => `${f.name} (${f.content.length}B)`).join("   ");
    return { handled: true, output: [out] };
  } else if (cmd === "cat") {
    const target = safeFiles.find((f) => f.name === arg);
    if (!target) {
      return { handled: true, output: [`cat: ${arg || "<missing>"}: No such file in workspace`] };
    }
    return { handled: true, output: [target.content] };
  } else if (cmd === "echo") {
    let echoStr = rest;
    if ((echoStr.startsWith('"') && echoStr.endsWith('"')) || (echoStr.startsWith("'") && echoStr.endsWith("'"))) {
      echoStr = echoStr.slice(1, -1);
    }
    return { handled: true, output: [echoStr] };
  } else if (cmd === "wc") {
    const target = safeFiles.find((f) => f.name === arg);
    if (!target) {
      return { handled: true, output: [`wc: ${arg || "<missing>"}: No such file in workspace`] };
    }
    const content = target.content;
    const lines = content.split("\n").length;
    const words = content.split(/\s+/).filter((w) => w.length > 0).length;
    const chars = content.length;
    return { handled: true, output: [`${lines} ${words} ${chars} ${arg}`] };
  }

  return { handled: false };
}
