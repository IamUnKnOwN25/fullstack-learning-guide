import { describe, it, expect } from 'vitest';
import manifest from '../app/manifest';

describe('PWA Manifest', () => {
  it('should return valid PWA manifest metadata', () => {
    const config = manifest();

    expect(config.display).toBe('standalone');
    expect(config.theme_color).toBe('#22d3ee');
    expect(config.background_color).toBe('#0f172a');
    expect(config.icons).toBeInstanceOf(Array);
    expect(config.icons?.length).toBeGreaterThan(0);

    const icon192 = config.icons?.find((icon) => icon.sizes === '192x192');
    expect(icon192).toBeDefined();
    expect(icon192?.src).toBe('/icons/icon-192x192.png');

    const icon512 = config.icons?.find((icon) => icon.sizes === '512x512');
    expect(icon512).toBeDefined();
    expect(icon512?.src).toBe('/icons/icon-512x512.png');

    expect(config.name).toBe('DevQuest: The Web Matrix Chronicles');
  });
});
