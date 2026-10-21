import { IdeFile } from "./ideBundler";

export interface TerminalCommandContext {
  files: IdeFile[];
}

export interface TerminalCommandResult {
  output?: string[];
  clear?: boolean;
  handled: boolean;
}

export function executeTerminalCommand(
  rawInput: string,
  context: TerminalCommandContext
): TerminalCommandResult {
  const parts = rawInput.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const arg = parts[1];
  const rest = rawInput.trim().substring(cmd.length).trim();

  if (cmd === "help") {
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
        "  wc <filename>      Count lines, words, and characters in a file"
      ],
    };
  } else if (cmd === "clear") {
    return { handled: true, clear: true };
  } else if (cmd === "ls") {
    const out = context.files.map((f) => `${f.name} (${f.content.length}B)`).join("   ");
    return { handled: true, output: [out] };
  } else if (cmd === "cat") {
    const target = context.files.find((f) => f.name === arg);
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
    const target = context.files.find((f) => f.name === arg);
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
