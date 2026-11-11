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
  "grep",
  "head",
  "tail",
];

function tokenizeArgs(input: string): string[] {
  const tokens: string[] = [];
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    if (match[1] !== undefined) {
      tokens.push(match[1]);
    } else if (match[2] !== undefined) {
      tokens.push(match[2]);
    } else {
      tokens.push(match[0]);
    }
  }
  return tokens;
}

function parseHeadTailArgs(rawArgs: string): { count: number; filename?: string } {
  const tokens = tokenizeArgs(rawArgs);
  let count = 10;
  let filename: string | undefined;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "-n") {
      if (i + 1 < tokens.length) {
        const next = tokens[i + 1];
        const parsed = parseInt(next, 10);
        if (!isNaN(parsed)) {
          count = parsed;
          i++;
        }
      }
    } else if (/^-n\d+$/i.test(t)) {
      const parsed = parseInt(t.slice(2), 10);
      if (!isNaN(parsed)) {
        count = parsed;
      }
    } else if (/^-\d+$/.test(t)) {
      const parsed = parseInt(t.slice(1), 10);
      if (!isNaN(parsed)) {
        count = parsed;
      }
    } else if (!filename) {
      filename = t;
    }
  }

  if (isNaN(count) || count < 1) {
    count = 1;
  } else {
    count = Math.floor(count);
  }

  return { count, filename };
}

function parseGrepArgs(rawArgs: string): {
  caseInsensitive: boolean;
  invertMatch: boolean;
  pattern?: string;
  filename?: string;
} {
  const tokens = tokenizeArgs(rawArgs);
  let caseInsensitive = false;
  let invertMatch = false;
  const positional: string[] = [];

  for (const token of tokens) {
    if (token.startsWith("-") && token.length > 1) {
      let isFlag = true;
      const chars = token.slice(1);
      for (const ch of chars) {
        if (ch === "i" || ch === "I") {
          caseInsensitive = true;
        } else if (ch === "v" || ch === "V") {
          invertMatch = true;
        } else {
          isFlag = false;
          break;
        }
      }
      if (!isFlag) {
        positional.push(token);
      }
    } else {
      positional.push(token);
    }
  }

  return {
    caseInsensitive,
    invertMatch,
    pattern: positional[0],
    filename: positional[1],
  };
}

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
  const safeFiles = (Array.isArray(context?.files) ? context.files : []).filter(
    (f): f is IdeFile => f != null && typeof f === "object"
  );

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
        grep: "grep [-i] [-v] <pattern> [filename] - Search for patterns in workspace files",
        head: "head [-n count] <filename> - Display first lines of a virtual file",
        tail: "tail [-n count] <filename> - Display last lines of a virtual file",
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
        "  grep [-i] [-v]     Search for pattern in files",
        "  head [-n <count>]  Display first lines of a file",
        "  tail [-n <count>]  Display last lines of a file",
      ],
    };
  } else if (cmd === "clear" || cmd === "cls") {
    return { handled: true, clear: true };
  } else if (cmd === "pwd") {
    return { handled: true, output: ["/workspace (virtual dev environment)"] };
  } else if (cmd === "whoami") {
    return { handled: true, output: ["operator (virtual dev environment)"] };
  } else if (cmd === "ls") {
    const out = safeFiles
      .map(
        (f) =>
          `${typeof f.name === "string" ? f.name : ""} (${
            typeof f.content === "string" ? f.content.length : 0
          }B)`
      )
      .join("   ");
    return { handled: true, output: [out] };
  } else if (cmd === "cat") {
    const target = safeFiles.find((f) => f.name === arg);
    if (!target) {
      return { handled: true, output: [`cat: ${arg || "<missing>"}: No such file in workspace`] };
    }
    return { handled: true, output: [typeof target.content === "string" ? target.content : ""] };
  } else if (cmd === "echo") {
    let echoStr = rest;
    if (
      (echoStr.startsWith('"') && echoStr.endsWith('"')) ||
      (echoStr.startsWith("'") && echoStr.endsWith("'"))
    ) {
      echoStr = echoStr.slice(1, -1);
    }
    return { handled: true, output: [echoStr] };
  } else if (cmd === "wc") {
    const target = safeFiles.find((f) => f.name === arg);
    if (!target) {
      return { handled: true, output: [`wc: ${arg || "<missing>"}: No such file in workspace`] };
    }
    const content = typeof target.content === "string" ? target.content : "";
    const lines = content.split("\n").length;
    const words = content.split(/\s+/).filter((w) => w.length > 0).length;
    const chars = content.length;
    return { handled: true, output: [`${lines} ${words} ${chars} ${arg}`] };
  } else if (cmd === "grep") {
    const { caseInsensitive, invertMatch, pattern, filename } = parseGrepArgs(rest);
    if (!pattern) {
      return { handled: true, output: ["grep: missing search pattern"] };
    }

    if (filename) {
      const target = safeFiles.find((f) => f.name === filename);
      if (!target) {
        return { handled: true, output: [`grep: ${filename}: No such file in workspace`] };
      }
      const content = typeof target.content === "string" ? target.content : "";
      const lines = content ? content.split(/\r?\n/) : [];
      const searchPattern = caseInsensitive ? pattern.toLowerCase() : pattern;
      const matches: string[] = [];

      for (const line of lines) {
        const compareLine = caseInsensitive ? line.toLowerCase() : line;
        const isContained = compareLine.includes(searchPattern);
        if (invertMatch ? !isContained : isContained) {
          matches.push(line);
        }
      }

      if (matches.length === 0) {
        return { handled: true, output: ["grep: no matches found"] };
      }
      return { handled: true, output: matches };
    }

    // No filename given -> search all workspace files
    const searchPattern = caseInsensitive ? pattern.toLowerCase() : pattern;
    const matches: string[] = [];

    for (const file of safeFiles) {
      if (!file || typeof file !== "object") continue;
      const fileName = typeof file.name === "string" ? file.name : "";
      const content = typeof file.content === "string" ? file.content : "";
      const lines = content ? content.split(/\r?\n/) : [];

      for (const line of lines) {
        const compareLine = caseInsensitive ? line.toLowerCase() : line;
        const isContained = compareLine.includes(searchPattern);
        if (invertMatch ? !isContained : isContained) {
          matches.push(`${fileName}:${line}`);
        }
      }
    }

    if (matches.length === 0) {
      return { handled: true, output: ["grep: no matches found"] };
    }
    return { handled: true, output: matches };
  } else if (cmd === "head") {
    const { count, filename } = parseHeadTailArgs(rest);
    if (!filename) {
      return { handled: true, output: [`head: <missing>: No such file in workspace`] };
    }
    const target = safeFiles.find((f) => f.name === filename);
    if (!target) {
      return { handled: true, output: [`head: ${filename}: No such file in workspace`] };
    }
    const content = typeof target.content === "string" ? target.content : "";
    const lines = content ? content.split(/\r?\n/) : [];
    const sliced = lines.slice(0, count);
    return { handled: true, output: [sliced.join("\n")] };
  } else if (cmd === "tail") {
    const { count, filename } = parseHeadTailArgs(rest);
    if (!filename) {
      return { handled: true, output: [`tail: <missing>: No such file in workspace`] };
    }
    const target = safeFiles.find((f) => f.name === filename);
    if (!target) {
      return { handled: true, output: [`tail: ${filename}: No such file in workspace`] };
    }
    const content = typeof target.content === "string" ? target.content : "";
    const lines = content ? content.split(/\r?\n/) : [];
    const startIdx = Math.max(0, lines.length - count);
    const sliced = lines.slice(startIdx);
    return { handled: true, output: [sliced.join("\n")] };
  }

  return { handled: false };
}
