export interface SkillNode {
  id: string;
  name: string;
  category: "foundations" | "frontend" | "backend" | "devops" | "mastery";
  description: string;
  icon: string;
  cost: number;
  unlockedByDefault?: boolean;
}

export const SKILL_TREE: SkillNode[] = [
  {
    id: "syntax_sense",
    name: "Syntax Sense",
    category: "foundations",
    description: "Your cybernetic eyes perceive syntactic anomalies before they manifest into runtime exceptions.",
    icon: "Eye",
    cost: 1,
    unlockedByDefault: true,
  },
  {
    id: "lint_shield",
    name: "Lint Barrier",
    category: "foundations",
    description: "Absorbs 1 incorrect test penalty strike during intense Boss Battles without taking damage.",
    icon: "Shield",
    cost: 2,
  },
  {
    id: "reactive_flow",
    name: "Reactive Flow",
    category: "frontend",
    description: "Harmonizes component state trees, granting +25% XP on all React and Next.js quest completions.",
    icon: "Atom",
    cost: 3,
  },
  {
    id: "async_teleport",
    name: "Async Teleport",
    category: "backend",
    description: "Executes non-blocking microtask queries with instantaneous resolution speed.",
    icon: "Zap",
    cost: 3,
  },
  {
    id: "container_forge",
    name: "Container Forge",
    category: "devops",
    description: "Crafts immutable multi-stage Docker vessels that reduce image sizes by 90%.",
    icon: "Cpu",
    cost: 4,
  },
  {
    id: "matrix_grandmaster",
    name: "Matrix Grandmaster",
    category: "mastery",
    description: "The ultimate mastery perk: Unlocks golden neon avatar borders, title 'Full-Stack Archmage', and the Capstone Citadel.",
    icon: "Crown",
    cost: 5,
  },
];
