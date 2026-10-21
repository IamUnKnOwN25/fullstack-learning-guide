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
  ];

  it("handles help command", () => {
    const res = executeTerminalCommand("help", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toContain("Available matrix-sh commands");
  });

  it("handles ls command", () => {
    const res = executeTerminalCommand("ls", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toContain("index.html (32B)");
    expect(res.output?.[0]).toContain("script.js (20B)");
  });

  it("handles cat command", () => {
    const res = executeTerminalCommand("cat index.html", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toBe("<h1>Hello World</h1>\n<p>Test</p>");
  });

  it("handles cat command for missing file", () => {
    const res = executeTerminalCommand("cat missing.txt", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toContain("cat: missing.txt: No such file");
  });

  it("handles echo command", () => {
    const res = executeTerminalCommand("echo hello world", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toBe("hello world");
  });

  it("handles echo command with quotes", () => {
    const res = executeTerminalCommand("echo \"hello world\"", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toBe("hello world");
  });

  it("handles wc command", () => {
    const res = executeTerminalCommand("wc index.html", { files: mockFiles });
    expect(res.handled).toBe(true);
    // 2 lines, 3 words, 32 chars
    // <h1>Hello World</h1> (1 word), \n (1 char), <p>Test</p> (1 word)? Wait, split(/\s+/) gives:
    // "<h1>Hello", "World</h1>", "<p>Test</p>" - 3 words
    expect(res.output?.[0]).toBe("2 3 32 index.html");
  });

  it("handles wc command for missing file", () => {
    const res = executeTerminalCommand("wc missing.txt", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toContain("wc: missing.txt: No such file");
  });

  it("handles clear command", () => {
    const res = executeTerminalCommand("clear", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.clear).toBe(true);
  });

  it("returns unhandled for unknown command", () => {
    const res = executeTerminalCommand("unknowncmd", { files: mockFiles });
    expect(res.handled).toBe(false);
  });
});
