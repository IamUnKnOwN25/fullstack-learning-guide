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
    expect(executeTerminalCommand(null as any, { files: mockFiles }).handled).toBe(false);
  });

  it("handles cls alias for clear and man alias for help", () => {
    const clsRes = executeTerminalCommand("cls", { files: mockFiles });
    expect(clsRes.handled).toBe(true);
    expect(clsRes.clear).toBe(true);

    const manRes = executeTerminalCommand("man", { files: mockFiles });
    expect(manRes.handled).toBe(true);
    expect(manRes.output?.[0]).toContain("Available matrix-sh commands");
  });

  it("handles pwd command returning virtual workspace directory", () => {
    const res = executeTerminalCommand("pwd", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toBe("/workspace (virtual dev environment)");
  });

  it("handles help subcommands for individual command documentation", () => {
    const helpLs = executeTerminalCommand("help ls", { files: mockFiles });
    expect(helpLs.handled).toBe(true);
    expect(helpLs.output?.[0]).toContain("ls - List all files in the active workspace");

    const helpCat = executeTerminalCommand("help cat", { files: mockFiles });
    expect(helpCat.handled).toBe(true);
    expect(helpCat.output?.[0]).toContain("cat <filename> - Print entire content");
  });

  it("handles whoami command returning active operator identity", () => {
    const res = executeTerminalCommand("whoami", { files: mockFiles });
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toBe("operator (virtual dev environment)");

    const upper = executeTerminalCommand("WHOAMI", { files: mockFiles });
    expect(upper.handled).toBe(true);
    expect(upper.output?.[0]).toBe("operator (virtual dev environment)");

    const withArgs = executeTerminalCommand("whoami status", { files: mockFiles });
    expect(withArgs.handled).toBe(true);
    expect(withArgs.output?.[0]).toBe("operator (virtual dev environment)");
  });

  it("handles nullish and corrupt file entries safely across ls, cat, and wc", () => {
    const corruptFiles: any[] = [
      null,
      undefined,
      {
        name: "index.html",
        language: "html",
        content: "<h1>Hello</h1>",
      },
      {
        name: "missing-content.txt",
        language: "text",
        content: undefined,
      },
      {
        name: "null-content.txt",
        language: "text",
        content: null,
      },
      {
        name: "numeric-content.txt",
        language: "text",
        content: 42,
      },
    ];

    // ls should skip nullish entries and treat undefined/non-string content as empty (0B)
    const lsRes = executeTerminalCommand("ls", { files: corruptFiles });
    expect(lsRes.handled).toBe(true);
    expect(lsRes.output?.[0]).toContain("index.html (14B)");
    expect(lsRes.output?.[0]).toContain("missing-content.txt (0B)");
    expect(lsRes.output?.[0]).toContain("null-content.txt (0B)");
    expect(lsRes.output?.[0]).toContain("numeric-content.txt (0B)");

    // cat should treat missing/non-string content as empty string without throwing
    const catValid = executeTerminalCommand("cat index.html", { files: corruptFiles });
    expect(catValid.handled).toBe(true);
    expect(catValid.output?.[0]).toBe("<h1>Hello</h1>");

    const catMissingContent = executeTerminalCommand("cat missing-content.txt", { files: corruptFiles });
    expect(catMissingContent.handled).toBe(true);
    expect(catMissingContent.output?.[0]).toBe("");

    const catNullContent = executeTerminalCommand("cat null-content.txt", { files: corruptFiles });
    expect(catNullContent.handled).toBe(true);
    expect(catNullContent.output?.[0]).toBe("");

    const catNumericContent = executeTerminalCommand("cat numeric-content.txt", { files: corruptFiles });
    expect(catNumericContent.handled).toBe(true);
    expect(catNumericContent.output?.[0]).toBe("");

    // wc should calculate lines, words, chars on treated empty string without throwing
    const wcValid = executeTerminalCommand("wc index.html", { files: corruptFiles });
    expect(wcValid.handled).toBe(true);
    expect(wcValid.output?.[0]).toBe("1 1 14 index.html");

    const wcMissingContent = executeTerminalCommand("wc missing-content.txt", { files: corruptFiles });
    expect(wcMissingContent.handled).toBe(true);
    expect(wcMissingContent.output?.[0]).toBe("1 0 0 missing-content.txt");

    const wcNullContent = executeTerminalCommand("wc null-content.txt", { files: corruptFiles });
    expect(wcNullContent.handled).toBe(true);
    expect(wcNullContent.output?.[0]).toBe("1 0 0 null-content.txt");

    const wcNumericContent = executeTerminalCommand("wc numeric-content.txt", { files: corruptFiles });
    expect(wcNumericContent.handled).toBe(true);
    expect(wcNumericContent.output?.[0]).toBe("1 0 0 numeric-content.txt");
  });

  it("handles pure nullish file arrays across ls, cat, and wc without throwing", () => {
    const nullishFiles: any[] = [null, undefined];

    const lsRes = executeTerminalCommand("ls", { files: nullishFiles });
    expect(lsRes.handled).toBe(true);
    expect(lsRes.output?.[0]).toBe("");

    const catRes = executeTerminalCommand("cat file.txt", { files: nullishFiles });
    expect(catRes.handled).toBe(true);
    expect(catRes.output?.[0]).toContain("cat: file.txt: No such file in workspace");

    const wcRes = executeTerminalCommand("wc file.txt", { files: nullishFiles });
    expect(wcRes.handled).toBe(true);
    expect(wcRes.output?.[0]).toContain("wc: file.txt: No such file in workspace");
  });

  it("handles nullish context safely without throwing", () => {
    const res = executeTerminalCommand("ls", null as any);
    expect(res.handled).toBe(true);
    expect(res.output?.[0]).toBe("");
  });
});
