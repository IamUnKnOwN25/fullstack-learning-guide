import { describe, it, expect } from 'vitest';
import { getCompanionDialogue } from '../lib/companionDialogue';

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
