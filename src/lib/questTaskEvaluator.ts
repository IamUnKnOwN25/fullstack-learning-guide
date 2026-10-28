/**
 * Real-time per-objective evaluator for DevQuest coding trials.
 * Strips comments before checking code patterns so starter TODO comments
 * never falsely mark objectives as completed.
 */

export function stripComments(code?: string | null): string {
  if (!code || typeof code !== "string") {
    return "";
  }

  return code
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(["'`])(?:\\.|(?!\1)[^\\])*\1|(?<!:)\/\/.*$/gm, (match, quote) => {
      if (quote) return match;
      return "";
    })
    .replace(/^\s*--.*$/gm, "")
    .replace(/^\s*#.*$/gm, "");
}

const QUEST_TASK_RULES: Record<string, Array<(cleanCode: string, rawCode: string) => boolean>> = {
  html_1_skeleton: [
    (c) => /<meta\s+charset=["']utf-8["']/i.test(c),
    (c) => /<meta\s+name=["']viewport["']/i.test(c),
    (c) => /<h1[\s\S]*?>[\s\S]+?<\/h1>/i.test(c),
    (c) => /<p[\s\S]*?>[\s\S]+?<\/p>/i.test(c),
  ],
  html_2_forms: [
    (c) =>
      /<label[^>]*for=["']email["']/i.test(c) &&
      (/<input[^>]*id=["']email["'][^>]*type=["']email["']/i.test(c) ||
        /<input[^>]*type=["']email["'][^>]*id=["']email["']/i.test(c)),
    (c) =>
      /<label[^>]*for=["']password["']/i.test(c) &&
      /<input[^>]*type=["']password["']/i.test(c),
    (c) => /<button[^>]*type=["']submit["'][\s\S]*?>[\s\S]*?<\/button>/i.test(c),
  ],
  css_1_flexbox: [
    (c) => /display\s*:\s*flex/i.test(c),
    (c) => /justify-content\s*:\s*(space-between|space-around|space-evenly)/i.test(c),
    (c) => /align-items\s*:\s*center/i.test(c),
  ],
  css_2_grid: [
    (c) => /display\s*:\s*grid/i.test(c),
    (c) =>
      /grid-template-columns\s*:\s*repeat\s*\(\s*auto-fit\s*,\s*minmax\s*\(\s*200px\s*,\s*1fr\s*\)\s*\)/i.test(
        c
      ),
    (c) => /gap\s*:\s*1rem/i.test(c),
  ],
  js_1_dom: [
    (c) => /addEventListener\s*\(\s*['"]click['"]/i.test(c),
    (c) => /power\s*(\+=\s*10|\+\+)/i.test(c),
    (c) => /textContent\s*=\s*/i.test(c),
  ],
  js_2_async: [
    (c) => /try\s*\{[\s\S]*\}\s*catch/i.test(c),
    (c) => /await\s+fetch\s*\(/i.test(c),
    (c) => /(res|response)\.ok/i.test(c),
    (c) => /\.json\s*\(\s*\)/i.test(c),
  ],
  ts_1_interfaces: [
    (c) => /id\s*:\s*['"][\w-]+['"]/i.test(c),
    (c) => /name\s*:\s*['"][^'"]+['"]/i.test(c),
    (c) => /level\s*:\s*\d+/i.test(c),
    (c) => /isOnline\s*:\s*(true|false)/i.test(c),
  ],
  ts_2_generics: [
    (c) => /interface\s+ApiResponse\s*<\s*T\s*>/i.test(c) && /data\s*:\s*T/i.test(c),
    (c) =>
      /function\s+wrapResponse\s*<\s*T\s*>\s*\(\s*payload\s*:\s*T\s*\)/i.test(c) &&
      /data\s*:\s*payload/i.test(c),
  ],
  react_1_hooks: [
    (c) => /useState\s*\(\s*0\s*\)/i.test(c),
    (c) => /<button[\s\S]*?>[\s\S]*?<\/button>/i.test(c),
    (c) => /onClick\s*=\s*\{[\s\S]*?setCount/i.test(c),
  ],
  react_2_server_actions: [
    (c) => /['"]use server['"]/i.test(c),
    (c) => /formData\.get\s*\(\s*['"]title['"]\s*\)/i.test(c),
    (c) => /revalidatePath\s*\(\s*['"]\/quests['"]\s*\)/i.test(c),
    (c) => /return\s*\{\s*success\s*:\s*true\s*\}/i.test(c),
  ],
  backend_1_express_rest: [
    (c) => /app\.get\s*\(\s*['"]\/api\/health['"]/i.test(c),
    (c) => /res\.status\s*\(\s*200\s*\)\.json/i.test(c),
    (c) => /app\.post\s*\(\s*['"]\/api\/tasks['"]/i.test(c),
    (c) => /res\.status\s*\(\s*201\s*\)\.json/i.test(c),
  ],
  backend_2_jwt_auth: [
    (c) => /req\.headers\.authorization/i.test(c),
    (c) => /jwt\.verify\s*\(/i.test(c),
    (c) => /res\.locals\.user\s*=/i.test(c),
    (c) => /res\.status\s*\(\s*401\s*\)/i.test(c),
  ],
  db_1_postgres: [
    (c) => /create\s+table\s+users/i.test(c) && /email\s+text\s+unique\s+not\s+null/i.test(c),
    (c) => /create\s+table\s+tasks/i.test(c) && /references\s+users\s*\(\s*id\s*\)/i.test(c),
    (c) => /on\s+delete\s+cascade/i.test(c),
  ],
  db_2_indexes_prisma: [
    (c) => /create\s+index\s+idx_tasks_user_id\s+on\s+tasks\s*\(\s*user_id\s*\)/i.test(c),
    (c) =>
      /create\s+index\s+idx_tasks_user_created\s+on\s+tasks\s*\(\s*user_id\s*,\s*created_at(\s+desc)?\s*\)/i.test(
        c
      ),
  ],
  devops_1_docker: [
    (c) => /FROM\s+node:[\w.-]+\s+AS\s+build/i.test(c),
    (c) => /RUN\s+npm\s+run\s+build/i.test(c),
    (c) => (c.match(/FROM\s+node:/gi) || []).length >= 2,
    (c) => /COPY\s+--from=build/i.test(c),
    (c) => /USER\s+node/i.test(c),
  ],
  devops_2_github_actions: [
    (c) => /on:\s*(\[\s*push|\s*push:)/i.test(c),
    (c) => /runs-on:\s*ubuntu-latest/i.test(c),
    (c) => /actions\/checkout/i.test(c),
    (c) => /actions\/setup-node/i.test(c),
    (c) => /npm\s+test/i.test(c),
  ],
  testing_1_unit_vitest: [
    (c) => /import\s*\{[\s\S]*?describe[\s\S]*?\}\s*from\s*['"]vitest['"]/i.test(c),
    (c) => /expect\s*\([\s\S]*?\)\.toBe\s*\(/i.test(c),
    (c) => /expect\s*\([\s\S]*?\)\.toThrow/i.test(c),
  ],
  testing_2_mocking: [
    (c) => /vi\.fn\s*\(/i.test(c),
    (c) => /sendNotification\s*\(\s*['"]/i.test(c),
    (c) => /toHaveBeenCalledTimes\s*\(\s*1\s*\)/i.test(c),
    (c) => /toHaveBeenCalledWith\s*\(/i.test(c),
  ],
  cs_1_binary_search: [
    (c) => /let\s+left\s*=\s*0/i.test(c) && /let\s+right\s*=\s*arr\.length\s*-\s*1/i.test(c),
    (c) => /const\s+mid\s*=\s*Math\.floor/i.test(c),
    (c) => /left\s*=\s*mid\s*\+\s*1/i.test(c) && /right\s*=\s*mid\s*-\s*1/i.test(c),
    (c) => /while\s*\(\s*left\s*<=\s*right\s*\)/i.test(c) && /return\s+-1/i.test(c),
  ],
  cs_2_hashmap_frequency: [
    (c) => /new\s+Map/i.test(c),
    (c) => /for\s*\([\s\S]*?of\s+items\)/i.test(c) && /counts\.(get|set)/i.test(c),
    (c) => /maxCount/i.test(c),
    (c) => /return\s+topItem/i.test(c),
  ],
  security_1_xss_sanitize: [
    (c) => /replace\s*\(\s*\/&\/g\s*,\s*["']&amp;["']\s*\)/i.test(c),
    (c) => /replace\s*\(\s*\/<\s*\/g\s*,\s*["']&lt;["']\s*\)/i.test(c),
    (c) => /replace\s*\(\s*\/>\/g\s*,\s*["']&gt;["']\s*\)/i.test(c),
    (c) => /&quot;/i.test(c),
    (c) => /&#0?39;/i.test(c),
  ],
  security_2_jwt_verification: [
    (c) => /jwt\.verify\s*\(/i.test(c),
    (c) => /algorithms\s*:\s*\[\s*['"]HS256['"]\s*\]/i.test(c),
  ],
  capstone_1_architecture: [
    (c) => /status\s*:\s*["']TODO["']\s*\|\s*["']IN_PROGRESS["']\s*\|\s*["']DONE["']/i.test(c),
    (c) =>
      /priority\s*:\s*["']LOW["']\s*\|\s*["']MEDIUM["']\s*\|\s*["']HIGH["']\s*\|\s*["']URGENT["']/i.test(
        c
      ),
    (c) => /task\.title/i.test(c) && /task\.status/i.test(c) && /task\.priority/i.test(c),
  ],
  capstone_2_health_probe: [
    (c) => /Promise\.all/i.test(c) && /db\.isConnected\s*\(/i.test(c) && /cache\.ping\s*\(/i.test(c),
    (c) => /status\s*:\s*['"]healthy['"]/i.test(c),
    (c) => /Promise\.all/i.test(c) && /status\s*:\s*['"]degraded['"]/i.test(c),
  ],
};

export function getRegisteredQuestIds(): string[] {
  return Object.keys(QUEST_TASK_RULES);
}

export function evaluateQuestTasks(
  questId?: string | null,
  tasks?: string[] | null,
  code?: string | null
): boolean[] {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }

  const safeCode = typeof code === "string" ? code : "";
  const cleanCode = stripComments(safeCode);
  const rules = questId ? QUEST_TASK_RULES[questId] : undefined;

  if (!rules) {
    return tasks.map(() => false);
  }

  return tasks.map((_, idx) => {
    const rule = rules[idx];
    return rule ? rule(cleanCode, safeCode) : false;
  });
}

export interface TaskDiagnostic {
  index: number;
  task: string;
  passed: boolean;
}

export function getQuestTaskDiagnostics(
  questId?: string | null,
  tasks?: string[] | null,
  code?: string | null
): TaskDiagnostic[] {
  if (!tasks || !Array.isArray(tasks)) {
    return [];
  }

  const results = evaluateQuestTasks(questId, tasks, code);
  return tasks.map((task, index) => ({
    index,
    task: task ?? "",
    passed: Boolean(results[index]),
  }));
}
