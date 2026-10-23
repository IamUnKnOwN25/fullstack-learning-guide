import { describe, it, expect } from "vitest";
import { executeTerminalCommand } from "../lib/ideTerminalCommands";
import { IdeFile } from "../lib/ideBundler";

describe("ideTerminalCommands", () => {
  const mockFiles: IdeFile[] = [
    {
      name: "index.html",
      language: "html",
      content: "<h1>Hello World</h1>\n<p>Test</p>",
    },
    {
      name: "script.js",
      language: "javascript",
      content: "console.log('test');",
    },
    {
      name: "empty.txt",
      language: "typescript",
      content: "",
    },
  ];

  it("handles help command and uppercase HELP", () => {
    const res = executeTerminalCommand("help", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toContain("Available matrix-sh commands");

    const upperRes = executeTerminalCommand("HELP", { files: mockFiles });
    expect(upperRes.handled).toBe(true);
    expect(upperRes.output?.[0]).toContain("Available matrix-sh commands");
  });

  it("handles ls command with file listings and sizes", () => {
    const res = executeTerminalCommand("ls", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toContain("index.html (32B)");
    expect(res.output?.[0]).toContain("script.js (20B)");
    expect(res.output?.[0]).toContain("empty.txt (0B)");
  });

  it("handles ls command on empty workspace", () => {
    const res = executeTerminalCommand("ls", { files: [] });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toBe("");
  });

  it("handles cat command", () => {
    const res = executeTerminalCommand("cat index.html", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toBe("<h1>Hello World</h1>\n<p>Test</p>");
  });

  it("handles cat command for missing file or omitted filename", () => {
    const res = executeTerminalCommand("cat missing.txt", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toContain("cat: missing.txt: No such file in workspace");

    const missingArg = executeTerminalCommand("cat", { files: mockFiles });
    expect(missingArg.handled).toBe(true);
    expect(missingArg.output?.[0]).toContain("cat: <missing>: No such file in workspace");
  });

  it("handles echo command with plain text, double quotes, and single quotes", () => {
    const plain = executeTerminalCommand("echo hello world", { files: mockFiles });
    expect(plain.handled).toBe(true);
    expect(plain.output?.[0]).toBe("hello world");

    const doubleQuotes = executeTerminalCommand('echo "matrix protocol"', { files: mockFiles });
    expect(doubleQuotes.handled).toBe(true);
    expect(doubleQuotes.output?.[0]).toBe("matrix protocol");

    const singleQuotes = executeTerminalCommand("echo 'cyber operative'", { files: mockFiles });
    expect(singleQuotes.handled).toBe(true);
    expect(singleQuotes.output?.[0]).toBe("cyber operative");

    const emptyEcho = executeTerminalCommand("echo", { files: mockFiles });
    expect(emptyEcho.handled).toBe(true);
    expect(emptyEcho.output?.[0]).toBe("");
  });

  it("handles wc command with word, line, and byte calculations", () => {
    const res = executeTerminalCommand("wc index.html", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toBe("2 3 32 index.html");

    const emptyWc = executeTerminalCommand("wc empty.txt", { files: mockFiles });
    expect(emptyWc.handled).toBe(true);
    expect(emptyWc.output?.[0]).toBe("1 0 0 empty.txt");
  });

  it("handles wc command for missing file or omitted filename", () => {
    const res = executeTerminalCommand("wc missing.txt", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toContain("wc: missing.txt: No such file in workspace");

    const missingArg = executeTerminalCommand("wc", { files: mockFiles });
    expect(missingArg.handled).toBe(true);
    expect(missingArg.output?.[0]).toContain("wc: <missing>: No such file in workspace");
  });

  it("handles clear command case-insensitively", () => {
    const res = executeTerminalCommand("clear", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.clear).toBe(true);

    const upperClear = executeTerminalCommand("CLEAR", { files: mockFiles });
    expect(upperClear.handled).toBe(true);
    expect(upperClear.clear).toBe(true);
  });

  it("returns unhandled for unknown commands, empty strings, and whitespace", () => {
    expect(executeTerminalCommand("unknowncmd", { files: mockFiles }).handled).toBe(false);
    expect(executeTerminalCommand("", { files: mockFiles }).handled).toBe(false);
    expect(executeTerminalCommand("    ", { files: mockFiles }).handled).toBe(false);
  });
});
