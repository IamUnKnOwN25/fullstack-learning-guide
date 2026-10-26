import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import manifest from '../app/manifest';

describe('PWA Manifest & Asset Verification', () => {
  it('returns valid PWA manifest configuration meeting installability criteria', () => {
    const config = manifest();

    expect(config.name).toBe('DevQuest: The Web Matrix Chronicles');
    expect(config.short_name).toBe('DevQuest');
    expect(config.description).toBe(
      'Learn Full-Stack Web Development through an interactive RPG quest adventure.'
    );
    expect(config.start_url).toBe('/');
    expect(config.display).toBe('standalone');
    expect(config.orientation).toBe('portrait-primary');
    expect(config.scope).toBe('/');
    expect(config.theme_color).toBe('#22d3ee');
    expect(config.background_color).toBe('#0f172a');
  });

  it('declares high-resolution standard icons for home-screen and splash installation', () => {
    const config = manifest();
    expect(config.icons).toBeInstanceOf(Array);
    expect(config.icons?.length).toBeGreaterThanOrEqual(2);

    const icon192 = config.icons?.find((icon) => icon.sizes === '192x192');
    expect(icon192).toBeDefined();
    expect(icon192?.src).toBe('/icons/icon-192x192.png');
    expect(icon192?.type).toBe('image/png');

    const icon512 = config.icons?.find((icon) => icon.sizes === '512x512');
    expect(icon512).toBeDefined();
    expect(icon512?.src).toBe('/icons/icon-512x512.png');
    expect(icon512?.type).toBe('image/png');
  });

  it('verifies that all referenced manifest icon files exist on disk with valid file size', () => {
    const config = manifest();
    const publicDir = path.resolve(process.cwd(), 'public');

    expect(config.icons).toBeDefined();

    for (const icon of config.icons || []) {
      // Relative path under public directory
      const cleanPath = icon.src.startsWith('/') ? icon.src.slice(1) : icon.src;
      const fullPath = path.join(publicDir, cleanPath);

      expect(fs.existsSync(fullPath)).toBe(true);

      const stats = fs.statSync(fullPath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0); // Valid PNG payload
    }
  });
});
