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

  it('should return correct tip for html realm', () => {
    const result = getCompanionDialogue({ realmId: 'html' });
    expect(result).toContain('A11y Wisdom');
  });

  it('should return correct tip for css realm', () => {
    const result = getCompanionDialogue({ realmId: 'css' });
    expect(result).toContain('In the CSS realm');
  });

  it('should return correct tip for typescript realm', () => {
    const result = getCompanionDialogue({ realmId: 'typescript' });
    expect(result).toContain('Tactical Intel');
  });

  it('should prioritize level-up over hasError', () => {
    const result = getCompanionDialogue({ justLeveledUp: true, hasError: true });
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
