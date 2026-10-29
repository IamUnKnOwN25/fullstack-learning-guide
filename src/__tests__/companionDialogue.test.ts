import { describe, it, expect } from 'vitest';
import {
  getCompanionDialogue,
  getDialogueForContext,
  sanitizeDialogueStats,
  DEFAULT_COMPANION_DIALOGUE,
  COMPANION_QUEST_DIALOGUES,
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
