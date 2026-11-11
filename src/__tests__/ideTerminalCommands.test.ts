import { describe, it, expect } from "vitest";
import { executeTerminalCommand, KNOWN_COMMANDS } from "../lib/ideTerminalCommands";
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
        language: "markdown",
        content: undefined,
      },
      {
        name: "null-content.txt",
        language: "markdown",
        content: null,
      },
      {
        name: "numeric-content.txt",
        language: "markdown",
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

  it("includes grep, head, and tail in KNOWN_COMMANDS", () => {
    expect(KNOWN_COMMANDS).toContain("grep");
    expect(KNOWN_COMMANDS).toContain("head");
    expect(KNOWN_COMMANDS).toContain("tail");
  });

  it("handles man grep, man head, and man tail documentation", () => {
    const manGrep = executeTerminalCommand("man grep", { files: mockFiles });
    expect(manGrep.handled).toBe(true);
    expect(manGrep.output?.[0]).toContain("grep");

    const manHead = executeTerminalCommand("man head", { files: mockFiles });
    expect(manHead.handled).toBe(true);
    expect(manHead.output?.[0]).toContain("head");

    const manTail = executeTerminalCommand("man tail", { files: mockFiles });
    expect(manTail.handled).toBe(true);
    expect(manTail.output?.[0]).toContain("tail");
  });

  it("handles grep command in single file with case-sensitivity, -i, and -v flags", () => {
    // Case sensitive match
    const matchRes = executeTerminalCommand("grep World index.html", { files: mockFiles });
    expect(matchRes.handled).toBe(true);
    expect(matchRes.output).toEqual(["<h1>Hello World</h1>"]);

    // Case sensitive miss
    const noMatch = executeTerminalCommand("grep world index.html", { files: mockFiles });
    expect(noMatch.handled).toBe(true);
    expect(noMatch.output?.[0]).toBe("grep: no matches found");

    // Case insensitive match with -i
    const ignoreCase = executeTerminalCommand("grep -i world index.html", { files: mockFiles });
    expect(ignoreCase.handled).toBe(true);
    expect(ignoreCase.output).toEqual(["<h1>Hello World</h1>"]);

    // Invert match with -v
    const invertRes = executeTerminalCommand("grep -v World index.html", { files: mockFiles });
    expect(invertRes.handled).toBe(true);
    expect(invertRes.output).toEqual(["<p>Test</p>"]);

    // Combined -i and -v
    const combined1 = executeTerminalCommand("grep -i -v test index.html", { files: mockFiles });
    expect(combined1.handled).toBe(true);
    expect(combined1.output).toEqual(["<h1>Hello World</h1>"]);

    const combined2 = executeTerminalCommand("grep -iv test index.html", { files: mockFiles });
    expect(combined2.handled).toBe(true);
    expect(combined2.output).toEqual(["<h1>Hello World</h1>"]);

    // Quoted pattern
    const quoted = executeTerminalCommand('grep "Hello World" index.html', { files: mockFiles });
    expect(quoted.handled).toBe(true);
    expect(quoted.output).toEqual(["<h1>Hello World</h1>"]);
  });

  it("handles grep across all workspace files with filename:line prefixing", () => {
    // Case sensitive multi-file
    const multiMatch = executeTerminalCommand("grep test", { files: mockFiles });
    expect(multiMatch.handled).toBe(true);
    expect(multiMatch.output).toEqual(["script.js:console.log('test');"]);

    // Case insensitive multi-file matches both files
    const multiIgnoreCase = executeTerminalCommand("grep -i test", { files: mockFiles });
    expect(multiIgnoreCase.handled).toBe(true);
    expect(multiIgnoreCase.output).toEqual([
      "index.html:<p>Test</p>",
      "script.js:console.log('test');",
    ]);

    // Multi-file no matches found
    const multiNone = executeTerminalCommand("grep nonexistent", { files: mockFiles });
    expect(multiNone.handled).toBe(true);
    expect(multiNone.output?.[0]).toBe("grep: no matches found");
  });

  it("handles grep error conditions for missing pattern or missing file", () => {
    const missingPattern = executeTerminalCommand("grep", { files: mockFiles });
    expect(missingPattern.handled).toBe(true);
    expect(missingPattern.output?.[0]).toContain("grep: missing search pattern");

    const flagOnly = executeTerminalCommand("grep -i", { files: mockFiles });
    expect(flagOnly.handled).toBe(true);
    expect(flagOnly.output?.[0]).toContain("grep: missing search pattern");

    const missingFile = executeTerminalCommand("grep World nonexistent.txt", { files: mockFiles });
    expect(missingFile.handled).toBe(true);
    expect(missingFile.output?.[0]).toBe("grep: nonexistent.txt: No such file in workspace");
  });

  it("handles head command with default count and -n flag including clamping", () => {
    const multiLineFile: IdeFile = {
      name: "multiline.txt",
      language: "markdown",
      content:
        "line 1\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\nline 9\nline 10\nline 11\nline 12",
    };
    const testFiles = [...mockFiles, multiLineFile];

    // Default 10 lines
    const defaultHead = executeTerminalCommand("head multiline.txt", { files: testFiles });
    expect(defaultHead.handled).toBe(true);
    expect(defaultHead.output?.[0].split("\n")).toHaveLength(10);
    expect(defaultHead.output?.[0]).toBe(
      "line 1\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\nline 9\nline 10"
    );

    // Explicit -n 3
    const head3 = executeTerminalCommand("head -n 3 multiline.txt", { files: testFiles });
    expect(head3.handled).toBe(true);
    expect(head3.output?.[0]).toBe("line 1\nline 2\nline 3");

    // Compact -n2
    const headCompact = executeTerminalCommand("head -n2 multiline.txt", { files: testFiles });
    expect(headCompact.handled).toBe(true);
    expect(headCompact.output?.[0]).toBe("line 1\nline 2");

    // Clamping 0 or negative counts to 1
    const headZero = executeTerminalCommand("head -n 0 multiline.txt", { files: testFiles });
    expect(headZero.handled).toBe(true);
    expect(headZero.output?.[0]).toBe("line 1");

    const headNegative = executeTerminalCommand("head -n -5 multiline.txt", { files: testFiles });
    expect(headNegative.handled).toBe(true);
    expect(headNegative.output?.[0]).toBe("line 1");

    // Missing file error
    const missingFile = executeTerminalCommand("head missing.txt", { files: testFiles });
    expect(missingFile.handled).toBe(true);
    expect(missingFile.output?.[0]).toBe("head: missing.txt: No such file in workspace");

    const missingArg = executeTerminalCommand("head", { files: testFiles });
    expect(missingArg.handled).toBe(true);
    expect(missingArg.output?.[0]).toBe("head: <missing>: No such file in workspace");
  });

  it("handles tail command with default count and -n flag including clamping", () => {
    const multiLineFile: IdeFile = {
      name: "multiline.txt",
      language: "markdown",
      content:
        "line 1\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\nline 9\nline 10\nline 11\nline 12",
    };
    const testFiles = [...mockFiles, multiLineFile];

    // Default 10 lines
    const defaultTail = executeTerminalCommand("tail multiline.txt", { files: testFiles });
    expect(defaultTail.handled).toBe(true);
    expect(defaultTail.output?.[0].split("\n")).toHaveLength(10);
    expect(defaultTail.output?.[0]).toBe(
      "line 3\nline 4\nline 5\nline 6\nline 7\nline 8\nline 9\nline 10\nline 11\nline 12"
    );

    // Explicit -n 3
    const tail3 = executeTerminalCommand("tail -n 3 multiline.txt", { files: testFiles });
    expect(tail3.handled).toBe(true);
    expect(tail3.output?.[0]).toBe("line 10\nline 11\nline 12");

    // Compact -n2
    const tailCompact = executeTerminalCommand("tail -n2 multiline.txt", { files: testFiles });
    expect(tailCompact.handled).toBe(true);
    expect(tailCompact.output?.[0]).toBe("line 11\nline 12");

    // Clamping 0 or negative counts to 1
    const tailZero = executeTerminalCommand("tail -n 0 multiline.txt", { files: testFiles });
    expect(tailZero.handled).toBe(true);
    expect(tailZero.output?.[0]).toBe("line 12");

    const tailNegative = executeTerminalCommand("tail -n -5 multiline.txt", { files: testFiles });
    expect(tailNegative.handled).toBe(true);
    expect(tailNegative.output?.[0]).toBe("line 12");

    // Missing file error
    const missingFile = executeTerminalCommand("tail missing.txt", { files: testFiles });
    expect(missingFile.handled).toBe(true);
    expect(missingFile.output?.[0]).toBe("tail: missing.txt: No such file in workspace");

    const missingArg = executeTerminalCommand("tail", { files: testFiles });
    expect(missingArg.handled).toBe(true);
    expect(missingArg.output?.[0]).toBe("tail: <missing>: No such file in workspace");
  });

  it("handles corrupt and nullish files safely for grep, head, and tail", () => {
    const corruptFiles: any[] = [
      null,
      undefined,
      {
        name: "index.html",
        language: "html",
        content: "<h1>Hello</h1>\n<p>World</p>",
      },
      {
        name: "null-content.txt",
        language: "markdown",
        content: null,
      },
      {
        name: "numeric-content.txt",
        language: "markdown",
        content: 42,
      },
    ];

    // grep on corrupt file content
    const grepCorrupt = executeTerminalCommand("grep -i hello", { files: corruptFiles });
    expect(grepCorrupt.handled).toBe(true);
    expect(grepCorrupt.output).toEqual(["index.html:<h1>Hello</h1>"]);

    // head on file with null content
    const headNull = executeTerminalCommand("head null-content.txt", { files: corruptFiles });
    expect(headNull.handled).toBe(true);
    expect(headNull.output?.[0]).toBe("");

    // tail on file with numeric content
    const tailNumeric = executeTerminalCommand("tail numeric-content.txt", { files: corruptFiles });
    expect(tailNumeric.handled).toBe(true);
    expect(tailNumeric.output?.[0]).toBe("");

    // pure nullish file arrays
    const nullishFiles: any[] = [null, undefined];
    const grepNullish = executeTerminalCommand("grep pattern", { files: nullishFiles });
    expect(grepNullish.handled).toBe(true);
    expect(grepNullish.output?.[0]).toBe("grep: no matches found");

    const headNullish = executeTerminalCommand("head file.txt", { files: nullishFiles });
    expect(headNullish.handled).toBe(true);
    expect(headNullish.output?.[0]).toContain("head: file.txt: No such file in workspace");

    const tailNullish = executeTerminalCommand("tail file.txt", { files: nullishFiles });
    expect(tailNullish.handled).toBe(true);
    expect(tailNullish.output?.[0]).toContain("tail: file.txt: No such file in workspace");
  });
});
