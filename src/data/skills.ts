export type SkillCategory =
  | "foundations"
  | "frontend"
  | "backend"
  | "devops"
  | "mastery";

export interface SkillNode {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  icon: string;
  cost: number;
  tier: 1 | 2 | 3;
  prerequisiteId?: string;
  unlockedByDefault?: boolean;
  statBonus?: string;
}

export const SKILL_CATEGORIES: { id: SkillCategory; label: string; icon: string; color: string }[] = [
  { id: "foundations", label: "Foundations & Styles", icon: "Shield", color: "text-matrix-neonCyan" },
  { id: "frontend", label: "Frontend & Reactive", icon: "Atom", color: "text-cyan-400" },
  { id: "backend", label: "Backend & Databases", icon: "Zap", color: "text-emerald-400" },
  { id: "devops", label: "DevOps & Cloud", icon: "Cpu", color: "text-indigo-400" },
  { id: "mastery", label: "Matrix Mastery", icon: "Crown", color: "text-matrix-neonGold" },
];

export const SKILL_TREE: SkillNode[] = [
  // Foundations Branch
  {
    id: "syntax_sense",
    name: "Syntax Sense",
    category: "foundations",
    tier: 1,
    description: "Your cybernetic eyes perceive syntactic anomalies before they manifest into runtime exceptions.",
    icon: "Eye",
    cost: 1,
    unlockedByDefault: true,
    statBonus: "Free Starter Talent",
  },
  {
    id: "lint_shield",
    name: "Lint Barrier",
    category: "foundations",
    tier: 1,
    description: "Absorbs 1 incorrect test penalty strike during intense Boss Battles without taking damage.",
    icon: "Shield",
    cost: 2,
    statBonus: "+1 Free Boss Strike Absorption",
  },
  {
    id: "cascade_harmonizer",
    name: "Cascade Harmonizer",
    category: "foundations",
    tier: 2,
    prerequisiteId: "syntax_sense",
    description: "Mastery of Flexbox and CSS Grid layout algorithms reduces environmental boss damage by 15%.",
    icon: "Sparkles",
    cost: 2,
    statBonus: "-15% Boss Damage Taken",
  },

  // Frontend Branch
  {
    id: "reactive_flow",
    name: "Reactive Flow",
    category: "frontend",
    tier: 1,
    description: "Harmonizes component state trees, granting +25% XP on all React and Next.js quest completions.",
    icon: "Atom",
    cost: 3,
    statBonus: "+25% React Quest XP",
  },
  {
    id: "state_synchronizer",
    name: "State Synchronizer",
    category: "frontend",
    tier: 2,
    prerequisiteId: "reactive_flow",
    description: "Eliminates stale closures in useEffect dependencies; increases your maximum mana by +20 MP.",
    icon: "Zap",
    cost: 3,
    statBonus: "+20 Max Mana",
  },
  {
    id: "server_action_warp",
    name: "Server Action Warp",
    category: "frontend",
    tier: 3,
    prerequisiteId: "state_synchronizer",
    description: "Seamlessly bridges client and server without REST boilerplate; increases maximum health by +30 HP.",
    icon: "Rocket",
    cost: 4,
    statBonus: "+30 Max Health",
  },

  // Backend Branch
  {
    id: "async_teleport",
    name: "Async Teleport",
    category: "backend",
    tier: 1,
    description: "Executes non-blocking microtask queries with instantaneous resolution; +25% Backend Quest XP.",
    icon: "Zap",
    cost: 3,
    statBonus: "+25% Node.js Quest XP",
  },
  {
    id: "event_loop_shield",
    name: "Event Loop Sentinel",
    category: "backend",
    tier: 2,
    prerequisiteId: "async_teleport",
    description: "Shields your terminal threads from CPU-blocking operations; reduces boss ability charge times.",
    icon: "Server",
    cost: 3,
    statBonus: "Faster Test Verification",
  },
  {
    id: "btree_indexer",
    name: "B-Tree Indexer",
    category: "backend",
    tier: 3,
    prerequisiteId: "event_loop_shield",
    description: "Balances database search trees with logarithmic efficiency; grants +25% SQL Quest XP and +20 MP.",
    icon: "Database",
    cost: 4,
    statBonus: "+25% SQL XP & +20 Max Mana",
  },

  // DevOps Branch
  {
    id: "container_forge",
    name: "Container Forge",
    category: "devops",
    tier: 1,
    description: "Crafts immutable multi-stage Docker vessels that reduce image sizes by 90%; +25% DevOps Quest XP.",
    icon: "Cpu",
    cost: 4,
    statBonus: "+25% DevOps Quest XP",
  },
  {
    id: "ci_pipeline_aegis",
    name: "CI Pipeline Aegis",
    category: "devops",
    tier: 2,
    prerequisiteId: "container_forge",
    description: "Automated deterministic test harnesses neutralise random flaky test failures in battle.",
    icon: "CheckCircle2",
    cost: 4,
    statBonus: "Immunity to Flaky Test Spells",
  },
  {
    id: "cluster_orchestrator",
    name: "Cluster Orchestrator",
    category: "devops",
    tier: 3,
    prerequisiteId: "ci_pipeline_aegis",
    description: "Self-healing pod deployment topologies boost your resilience; grants +40 Max HP.",
    icon: "Layers",
    cost: 5,
    statBonus: "+40 Max Health",
  },

  // Mastery Branch
  {
    id: "clean_code_aura",
    name: "Clean Code Aura",
    category: "mastery",
    tier: 1,
    description: "Refactoring clarity channels healing energy; automatically restores +20 HP after every completed trial.",
    icon: "Sparkles",
    cost: 4,
    statBonus: "+20 HP Heal on Quest Clear",
  },
  {
    id: "zero_day_warden",
    name: "Zero-Day Warden",
    category: "mastery",
    tier: 2,
    prerequisiteId: "clean_code_aura",
    description: "Enforces nonces, strict CORS policies, and Content-Security-Headers; +30 Max HP and +20 Max MP.",
    icon: "ShieldAlert",
    cost: 5,
    statBonus: "+30 HP & +20 MP Resilience",
  },
  {
    id: "matrix_grandmaster",
    name: "Matrix Grandmaster",
    category: "mastery",
    tier: 3,
    prerequisiteId: "zero_day_warden",
    description: "The ultimate mastery perk: Unlocks golden neon avatar borders, title 'Full-Stack Archmage', and +30% bonus XP on all platform activities.",
    icon: "Crown",
    cost: 5,
    statBonus: "Golden Avatar & +30% All XP",
  },
];

/**
 * Retrieve a skill node by its identifier.
 */
export function getSkillById(id: string): SkillNode | undefined {
  if (!id) return undefined;
  return SKILL_TREE.find((s) => s.id === id);
}

/**
 * Retrieve all skill nodes belonging to a specific branch category.
 */
export function getSkillsByCategory(category: SkillCategory): SkillNode[] {
  return SKILL_TREE.filter((s) => s.category === category);
}

/**
 * Retrieve all skills belonging to a specific tier (1, 2, or 3).
 */
export function getSkillsByTier(tier: 1 | 2 | 3): SkillNode[] {
  return SKILL_TREE.filter((s) => s.tier === tier);
}

/**
 * Traverses up the prerequisite tree for a given skill and returns
 * the ordered dependency chain from the root skill to the immediate prerequisite.
 */
export function getSkillPrerequisites(skillId: string): SkillNode[] {
  const chain: SkillNode[] = [];
  const visited = new Set<string>();
  let current = getSkillById(skillId);

  while (current && current.prerequisiteId) {
    if (visited.has(current.prerequisiteId)) {
      break; // Safeguard against circular dependencies
    }
    visited.add(current.prerequisiteId);
    const prereq = getSkillById(current.prerequisiteId);
    if (!prereq) break;
    chain.unshift(prereq);
    current = prereq;
  }

  return chain;
}

/**
 * Detects whether there are any circular dependencies within the skill tree.
 * Returns true if a cycle is detected, or false if the dependency graph is a valid DAG.
 */
export function detectSkillTreeCycles(): boolean {
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const skillMap = new Map<string, SkillNode>(SKILL_TREE.map((s) => [s.id, s]));

  const hasCycle = (nodeId: string): boolean => {
    visited.add(nodeId);
    recStack.add(nodeId);

    const node = skillMap.get(nodeId);
    if (node && node.prerequisiteId) {
      if (!visited.has(node.prerequisiteId)) {
        if (hasCycle(node.prerequisiteId)) return true;
      } else if (recStack.has(node.prerequisiteId)) {
        return true;
      }
    }

    recStack.delete(nodeId);
    return false;
  };

  for (const skill of SKILL_TREE) {
    if (!visited.has(skill.id)) {
      if (hasCycle(skill.id)) return true;
    }
  }

  return false;
}

/**
 * Calculates the total skill points required to unlock all available skills in the tree.
 */
export function getTotalSkillTreeCost(): number {
  return SKILL_TREE.reduce((acc, skill) => acc + skill.cost, 0);
}
