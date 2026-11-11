import { describe, it, expect } from 'vitest';
import {
  getCompanionDialogue,
  getDialogueForContext,
  sanitizeDialogueStats,
  getLowHealthWarning,
  getBossIntroDialogue,
  getCompanionTipByCategory,
  DEFAULT_COMPANION_DIALOGUE,
  DEFAULT_BOSS_INTRO_DIALOGUE,
  COMPANION_QUEST_DIALOGUES,
  BOSS_INTRO_DIALOGUES,
  COMPANION_CATEGORY_TIPS,
} from '../lib/companionDialogue';
import { REALMS } from '../data/realms';
import { QUESTS } from '../data/quests';

describe('companionDialogue', () => {
  it('should return level-up congratulations when justLeveledUp is true', () => {
    const result = getCompanionDialogue({ justLeveledUp: true });
    expect(result).toBe('Congratulations on leveling up! Your power grows!');
  });

  it('should return encouragement message when hasError is true', () => {
    const result = getCompanionDialogue({ hasError: true });
    expect(result).toBe("Don't give up! Every error is a learning opportunity. You can do this!");
  });

  it('should return pedagogical tips for each of the 12 campaign realms', () => {
    expect(getCompanionDialogue({ realmId: 'html' })).toContain('A11y Wisdom');
    expect(getCompanionDialogue({ realmId: 'css' })).toContain('Concept Visualizer');
    expect(getCompanionDialogue({ realmId: 'javascript' })).toContain('Microtask Queue');
    expect(getCompanionDialogue({ realmId: 'typescript' })).toContain('Tactical Intel');
    expect(getCompanionDialogue({ realmId: 'react' })).toContain('useEffect');
    expect(getCompanionDialogue({ realmId: 'backend' })).toContain('rejections');
    expect(getCompanionDialogue({ realmId: 'databases' })).toContain('Parameterized queries');
    expect(getCompanionDialogue({ realmId: 'devops' })).toContain('Multi-stage builds');
    expect(getCompanionDialogue({ realmId: 'testing' })).toContain('Flaky tests');
    expect(getCompanionDialogue({ realmId: 'cs' })).toContain('O(1)');
    expect(getCompanionDialogue({ realmId: 'security' })).toContain('sanitize user input');
    expect(getCompanionDialogue({ realmId: 'capstone' })).toContain('Capstone Insight');
  });

  it('guarantees unique, dedicated lore for every realm registered in REALMS', () => {
    const defaultLore = 'Stay alert! The matrix is ever-changing.';
    const seenTips = new Set<string>();

    for (const realm of REALMS) {
      const tip = getCompanionDialogue({ realmId: realm.id });
      expect(tip).not.toBe(defaultLore);
      expect(tip.length).toBeGreaterThan(20);
      expect(seenTips.has(tip)).toBe(false);
      seenTips.add(tip);
    }
  });

  it('handles case-insensitivity and whitespace padding in realmId', () => {
    expect(getCompanionDialogue({ realmId: 'REACT' })).toContain('useEffect');
    expect(getCompanionDialogue({ realmId: '  TypeScript  ' })).toContain('Tactical Intel');
    expect(getCompanionDialogue({ realmId: 'HTML' })).toContain('A11y Wisdom');
  });

  it('falls back to default greeting when realmId is empty or whitespace only', () => {
    expect(getCompanionDialogue({ realmId: '' })).toBe("I'm Byte, your cyber-companion! Let's conquer the matrix together.");
    expect(getCompanionDialogue({ realmId: '   ' })).toBe("I'm Byte, your cyber-companion! Let's conquer the matrix together.");
  });

  it('should prioritize level-up over hasError and realmId', () => {
    const result = getCompanionDialogue({ justLeveledUp: true, hasError: true, realmId: 'react' });
    expect(result).toBe('Congratulations on leveling up! Your power grows!');
  });

  it('should prioritize hasError over realmId', () => {
    const result = getCompanionDialogue({ hasError: true, realmId: 'html' });
    expect(result).toBe("Don't give up! Every error is a learning opportunity. You can do this!");
  });

  it('should return default message for unknown realmId', () => {
    const result = getCompanionDialogue({ realmId: 'unknown-realm' });
    expect(result).toBe('Stay alert! The matrix is ever-changing.');
  });

  it('should return generic default message for empty context', () => {
    const result = getCompanionDialogue({});
    expect(result).toBe("I'm Byte, your cyber-companion! Let's conquer the matrix together.");
  });
});

describe('getDialogueForContext & sanitizeDialogueStats', () => {
  describe('sanitizeDialogueStats', () => {
    it('sanitizes non-finite level values to default level 1', () => {
      expect(sanitizeDialogueStats(NaN, 100).level).toBe(1);
      expect(sanitizeDialogueStats(Infinity, 100).level).toBe(1);
      expect(sanitizeDialogueStats(-Infinity, 100).level).toBe(1);
      expect(sanitizeDialogueStats(undefined, 100).level).toBe(1);
      expect(sanitizeDialogueStats(null, 100).level).toBe(1);
      expect(sanitizeDialogueStats('invalid' as any, 100).level).toBe(1);
    });

    it('clamps negative or zero level values to minimum 1 and floors floats', () => {
      expect(sanitizeDialogueStats(0, 50).level).toBe(1);
      expect(sanitizeDialogueStats(-10, 50).level).toBe(1);
      expect(sanitizeDialogueStats(4.8, 50).level).toBe(4);
      expect(sanitizeDialogueStats(10, 50).level).toBe(10);
    });

    it('sanitizes non-finite hpPercent values to default 100%', () => {
      expect(sanitizeDialogueStats(1, NaN).hpPercent).toBe(100);
      expect(sanitizeDialogueStats(1, Infinity).hpPercent).toBe(100);
      expect(sanitizeDialogueStats(1, -Infinity).hpPercent).toBe(100);
      expect(sanitizeDialogueStats(1, undefined).hpPercent).toBe(100);
      expect(sanitizeDialogueStats(1, null).hpPercent).toBe(100);
      expect(sanitizeDialogueStats(1, 'invalid' as any).hpPercent).toBe(100);
    });

    it('clamps hpPercent strictly between 0 and 100', () => {
      expect(sanitizeDialogueStats(1, -50).hpPercent).toBe(0);
      expect(sanitizeDialogueStats(1, -0.01).hpPercent).toBe(0);
      expect(sanitizeDialogueStats(1, 0).hpPercent).toBe(0);
      expect(sanitizeDialogueStats(1, 50.5).hpPercent).toBe(50.5);
      expect(sanitizeDialogueStats(1, 100).hpPercent).toBe(100);
      expect(sanitizeDialogueStats(1, 100.1).hpPercent).toBe(100);
      expect(sanitizeDialogueStats(1, 250).hpPercent).toBe(100);
    });
  });

  describe('getDialogueForContext', () => {
    it('returns quest-specific dialogue for valid realmId and questId', () => {
      const htmlTip = getDialogueForContext('html', 'html_1_skeleton', 1, 100);
      expect(htmlTip).toBe(COMPANION_QUEST_DIALOGUES.html.html_1_skeleton);
      expect(htmlTip).toContain('<!DOCTYPE html>');

      const cssTip = getDialogueForContext('css', 'css_1_flexbox', 2, 85);
      expect(cssTip).toBe(COMPANION_QUEST_DIALOGUES.css.css_1_flexbox);
      expect(cssTip).toContain('Flexbox');

      const jsTip = getDialogueForContext('javascript', 'js_2_async', 3, 70);
      expect(jsTip).toBe(COMPANION_QUEST_DIALOGUES.javascript.js_2_async);
      expect(jsTip).toContain('Microtasks');

      const tsTip = getDialogueForContext('typescript', 'ts_2_generics', 4, 100);
      expect(tsTip).toBe(COMPANION_QUEST_DIALOGUES.typescript.ts_2_generics);
      expect(tsTip).toContain('Generics');
    });

    it('handles case-insensitivity and whitespace padding in realmId and questId', () => {
      expect(getDialogueForContext('  HTML  ', '  HTML_1_SKELETON  ')).toBe(
        COMPANION_QUEST_DIALOGUES.html.html_1_skeleton
      );
      expect(getDialogueForContext('REACT', 'REACT_1_HOOKS')).toBe(
        COMPANION_QUEST_DIALOGUES.react.react_1_hooks
      );
      expect(getDialogueForContext('  DevOps  ', '  DEVOPS_1_DOCKER  ')).toBe(
        COMPANION_QUEST_DIALOGUES.devops.devops_1_docker
      );
    });

    it('gracefully returns encouraging default fallback for unmapped realmId', () => {
      const result = getDialogueForContext('nonexistent-realm', 'html_1_skeleton', 1, 100);
      expect(result).toBe(DEFAULT_COMPANION_DIALOGUE);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('gracefully returns encouraging default fallback for unmapped questId', () => {
      const result = getDialogueForContext('html', 'nonexistent-quest', 1, 100);
      expect(result).toBe(DEFAULT_COMPANION_DIALOGUE);
    });

    it('gracefully returns encouraging default fallback for unmapped realmId and questId', () => {
      const result = getDialogueForContext('unknown-realm', 'unknown-quest', 1, 100);
      expect(result).toBe(DEFAULT_COMPANION_DIALOGUE);
    });

    it('gracefully returns encouraging fallback when realmId or questId is empty or whitespace', () => {
      expect(getDialogueForContext('', '')).toBe(DEFAULT_COMPANION_DIALOGUE);
      expect(getDialogueForContext('   ', '   ')).toBe(DEFAULT_COMPANION_DIALOGUE);
      expect(getDialogueForContext('html', '')).toBe(DEFAULT_COMPANION_DIALOGUE);
      expect(getDialogueForContext('', 'html_1_skeleton')).toBe(DEFAULT_COMPANION_DIALOGUE);
    });

    it('gracefully returns encouraging fallback when realmId or questId is null or undefined without throwing', () => {
      expect(getDialogueForContext(undefined, undefined)).toBe(DEFAULT_COMPANION_DIALOGUE);
      expect(getDialogueForContext(null, null)).toBe(DEFAULT_COMPANION_DIALOGUE);
      expect(getDialogueForContext('html', undefined)).toBe(DEFAULT_COMPANION_DIALOGUE);
      expect(getDialogueForContext(undefined, 'html_1_skeleton')).toBe(DEFAULT_COMPANION_DIALOGUE);
    });

    it('gracefully handles non-finite level and hpPercent without throwing or returning undefined', () => {
      // Non-finite stats with mapped realm/quest should successfully return the quest dialogue
      expect(getDialogueForContext('html', 'html_1_skeleton', NaN, NaN)).toBe(
        COMPANION_QUEST_DIALOGUES.html.html_1_skeleton
      );
      expect(getDialogueForContext('html', 'html_1_skeleton', Infinity, -Infinity)).toBe(
        COMPANION_QUEST_DIALOGUES.html.html_1_skeleton
      );
      expect(getDialogueForContext('html', 'html_1_skeleton', -Infinity, Infinity)).toBe(
        COMPANION_QUEST_DIALOGUES.html.html_1_skeleton
      );

      // Non-finite stats with unmapped realm/quest should gracefully return default fallback
      expect(getDialogueForContext('unmapped', 'unmapped', NaN, NaN)).toBe(
        DEFAULT_COMPANION_DIALOGUE
      );
      expect(getDialogueForContext('unmapped', 'unmapped', Infinity, -Infinity)).toBe(
        DEFAULT_COMPANION_DIALOGUE
      );
      expect(getDialogueForContext('unmapped', 'unmapped', -50, 9999)).toBe(
        DEFAULT_COMPANION_DIALOGUE
      );
    });

    it('guarantees dedicated dialogue for every quest across all 12 campaign realms', () => {
      for (const [realmId, questList] of Object.entries(QUESTS)) {
        for (const quest of questList) {
          const dialogue = getDialogueForContext(realmId, quest.id, 1, 100);
          expect(dialogue).not.toBe(DEFAULT_COMPANION_DIALOGUE);
          expect(dialogue.length).toBeGreaterThan(20);
        }
      }
    });
  });
});

describe('getLowHealthWarning', () => {
  it('returns null when health ratio is greater than 25%', () => {
    expect(getLowHealthWarning(26, 100)).toBeNull();
    expect(getLowHealthWarning(50, 100)).toBeNull();
    expect(getLowHealthWarning(100, 100)).toBeNull();
    expect(getLowHealthWarning(25.01, 100)).toBeNull();
  });

  it('returns low-health tactical warning when health is at or below 25% but above 10%', () => {
    const warning25 = getLowHealthWarning(25, 100);
    expect(warning25).not.toBeNull();
    expect(typeof warning25).toBe('string');
    expect(warning25).toContain('25%');

    const warning20 = getLowHealthWarning(20, 100);
    expect(warning20).not.toBeNull();
    expect(warning20).toContain('25%');

    const warning11 = getLowHealthWarning(11, 100);
    expect(warning11).not.toBeNull();
    expect(warning11).toContain('Tactical Warning');
  });

  it('returns critical warning when health is at or below 10%', () => {
    const critical10 = getLowHealthWarning(10, 100);
    expect(critical10).not.toBeNull();
    expect(critical10).toContain('CRITICAL WARNING');

    const critical5 = getLowHealthWarning(5, 100);
    expect(critical5).not.toBeNull();
    expect(critical5).toContain('CRITICAL WARNING');

    const critical0 = getLowHealthWarning(0, 100);
    expect(critical0).not.toBeNull();
    expect(critical0).toContain('CRITICAL WARNING');

    const negativeHp = getLowHealthWarning(-15, 100);
    expect(negativeHp).not.toBeNull();
    expect(negativeHp).toContain('CRITICAL WARNING');
  });

  it('returns null when maxHp is zero or negative', () => {
    expect(getLowHealthWarning(10, 0)).toBeNull();
    expect(getLowHealthWarning(10, -50)).toBeNull();
    expect(getLowHealthWarning(0, 0)).toBeNull();
    expect(getLowHealthWarning(-5, -10)).toBeNull();
  });

  it('returns null for non-finite hp or maxHp inputs', () => {
    expect(getLowHealthWarning(NaN, 100)).toBeNull();
    expect(getLowHealthWarning(10, NaN)).toBeNull();
    expect(getLowHealthWarning(Infinity, 100)).toBeNull();
    expect(getLowHealthWarning(10, Infinity)).toBeNull();
    expect(getLowHealthWarning(-Infinity, 100)).toBeNull();
    expect(getLowHealthWarning(10, -Infinity)).toBeNull();
    expect(getLowHealthWarning(undefined as any, 100)).toBeNull();
    expect(getLowHealthWarning(10, null as any)).toBeNull();
    expect(getLowHealthWarning('20' as any, 100)).toBeNull();
    expect(getLowHealthWarning(20, '100' as any)).toBeNull();
  });
});

describe('getBossIntroDialogue', () => {
  it('returns dedicated boss battle advice for all 12 campaign realms', () => {
    const realms = [
      'html',
      'css',
      'javascript',
      'typescript',
      'react',
      'backend',
      'databases',
      'devops',
      'testing',
      'cs',
      'security',
      'capstone',
    ];

    const seenDialogues = new Set<string>();

    for (const realmId of realms) {
      const dialogue = getBossIntroDialogue(realmId);
      expect(dialogue).not.toBe(DEFAULT_BOSS_INTRO_DIALOGUE);
      expect(dialogue.length).toBeGreaterThan(20);
      expect(dialogue).toContain('Boss Alert');
      expect(seenDialogues.has(dialogue)).toBe(false);
      seenDialogues.add(dialogue);
    }
  });

  it('normalizes case and surrounding whitespace in realmId', () => {
    expect(getBossIntroDialogue('  HTML  ')).toBe(BOSS_INTRO_DIALOGUES.html);
    expect(getBossIntroDialogue('REACT')).toBe(BOSS_INTRO_DIALOGUES.react);
    expect(getBossIntroDialogue('  TypeScript  ')).toBe(BOSS_INTRO_DIALOGUES.typescript);
    expect(getBossIntroDialogue('devops')).toBe(BOSS_INTRO_DIALOGUES.devops);
  });

  it('resolves shorthand aliases js, ts, and db correctly', () => {
    expect(getBossIntroDialogue('js')).toBe(BOSS_INTRO_DIALOGUES.javascript);
    expect(getBossIntroDialogue('JS')).toBe(BOSS_INTRO_DIALOGUES.javascript);
    expect(getBossIntroDialogue('  js  ')).toBe(BOSS_INTRO_DIALOGUES.javascript);

    expect(getBossIntroDialogue('ts')).toBe(BOSS_INTRO_DIALOGUES.typescript);
    expect(getBossIntroDialogue('TS')).toBe(BOSS_INTRO_DIALOGUES.typescript);

    expect(getBossIntroDialogue('db')).toBe(BOSS_INTRO_DIALOGUES.databases);
    expect(getBossIntroDialogue('DB')).toBe(BOSS_INTRO_DIALOGUES.databases);
    expect(getBossIntroDialogue('database')).toBe(BOSS_INTRO_DIALOGUES.databases);
  });

  it('falls back safely to default dialogue for unmapped or invalid realms', () => {
    expect(getBossIntroDialogue('unknown-realm')).toBe(DEFAULT_BOSS_INTRO_DIALOGUE);
    expect(getBossIntroDialogue('')).toBe(DEFAULT_BOSS_INTRO_DIALOGUE);
    expect(getBossIntroDialogue('   ')).toBe(DEFAULT_BOSS_INTRO_DIALOGUE);
    expect(getBossIntroDialogue(null as any)).toBe(DEFAULT_BOSS_INTRO_DIALOGUE);
    expect(getBossIntroDialogue(undefined as any)).toBe(DEFAULT_BOSS_INTRO_DIALOGUE);
  });
});

describe('getCompanionTipByCategory', () => {
  it('returns deterministic category tips with default seedIndex', () => {
    const frontendTip = getCompanionTipByCategory('frontend');
    expect(frontendTip).toBe(COMPANION_CATEGORY_TIPS.frontend[0]);
    expect(frontendTip).toContain('Frontend Tip');

    const backendTip = getCompanionTipByCategory('backend');
    expect(backendTip).toBe(COMPANION_CATEGORY_TIPS.backend[0]);
    expect(backendTip).toContain('Backend Tip');

    const devopsTip = getCompanionTipByCategory('devops');
    expect(devopsTip).toBe(COMPANION_CATEGORY_TIPS.devops[0]);
    expect(devopsTip).toContain('DevOps Tip');
  });

  it('cycles through tips deterministically based on seedIndex modulo', () => {
    const tip0 = getCompanionTipByCategory('databases', 0);
    const tip1 = getCompanionTipByCategory('databases', 1);
    const tip2 = getCompanionTipByCategory('databases', 2);
    const tip3 = getCompanionTipByCategory('databases', 3);

    expect(tip0).toBe(COMPANION_CATEGORY_TIPS.databases[0]);
    expect(tip1).toBe(COMPANION_CATEGORY_TIPS.databases[1]);
    expect(tip0).not.toBe(tip1);
    expect(tip3).toBe(COMPANION_CATEGORY_TIPS.databases[3 % COMPANION_CATEGORY_TIPS.databases.length]);
  });

  it('handles float seedIndex by flooring to nearest integer', () => {
    expect(getCompanionTipByCategory('testing', 1.9)).toBe(COMPANION_CATEGORY_TIPS.testing[1]);
  });

  it('resolves category aliases and normalizes whitespace and casing', () => {
    expect(getCompanionTipByCategory('  FRONTEND  ')).toBe(COMPANION_CATEGORY_TIPS.frontend[0]);
    expect(getCompanionTipByCategory('front-end')).toBe(COMPANION_CATEGORY_TIPS.frontend[0]);
    expect(getCompanionTipByCategory('back-end')).toBe(COMPANION_CATEGORY_TIPS.backend[0]);
    expect(getCompanionTipByCategory('db')).toBe(COMPANION_CATEGORY_TIPS.databases[0]);
    expect(getCompanionTipByCategory('database')).toBe(COMPANION_CATEGORY_TIPS.databases[0]);
    expect(getCompanionTipByCategory('cs')).toBe(COMPANION_CATEGORY_TIPS.theory[0]);
    expect(getCompanionTipByCategory('algorithms')).toBe(COMPANION_CATEGORY_TIPS.theory[0]);
    expect(getCompanionTipByCategory('boss')).toBe(COMPANION_CATEGORY_TIPS.bosses[0]);
    expect(getCompanionTipByCategory('quest')).toBe(COMPANION_CATEGORY_TIPS.quests[0]);
  });

  it('falls back safely to DEFAULT_COMPANION_DIALOGUE for unknown categories', () => {
    expect(getCompanionTipByCategory('unknown-category')).toBe(DEFAULT_COMPANION_DIALOGUE);
    expect(getCompanionTipByCategory('')).toBe(DEFAULT_COMPANION_DIALOGUE);
    expect(getCompanionTipByCategory('   ')).toBe(DEFAULT_COMPANION_DIALOGUE);
    expect(getCompanionTipByCategory(null as any)).toBe(DEFAULT_COMPANION_DIALOGUE);
    expect(getCompanionTipByCategory(undefined as any)).toBe(DEFAULT_COMPANION_DIALOGUE);
  });

  it('falls back safely to DEFAULT_COMPANION_DIALOGUE on negative or NaN seedIndex', () => {
    expect(getCompanionTipByCategory('frontend', -1)).toBe(DEFAULT_COMPANION_DIALOGUE);
    expect(getCompanionTipByCategory('frontend', -999)).toBe(DEFAULT_COMPANION_DIALOGUE);
    expect(getCompanionTipByCategory('frontend', NaN)).toBe(DEFAULT_COMPANION_DIALOGUE);
    expect(getCompanionTipByCategory('frontend', Infinity)).toBe(DEFAULT_COMPANION_DIALOGUE);
    expect(getCompanionTipByCategory('frontend', -Infinity)).toBe(DEFAULT_COMPANION_DIALOGUE);
    expect(getCompanionTipByCategory('frontend', '0' as any)).toBe(DEFAULT_COMPANION_DIALOGUE);
  });

  it('provides dedicated tips across all key skill and campaign categories', () => {
    const categories = [
      'foundations',
      'frontend',
      'backend',
      'databases',
      'devops',
      'testing',
      'theory',
      'security',
      'mastery',
      'bosses',
      'quests',
    ];

    for (const cat of categories) {
      const tip = getCompanionTipByCategory(cat, 0);
      expect(tip).not.toBe(DEFAULT_COMPANION_DIALOGUE);
      expect(tip.length).toBeGreaterThan(15);
    }
  });
});
