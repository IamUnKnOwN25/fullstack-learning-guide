import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DevQuest: The Web Matrix Chronicles',
    short_name: 'DevQuest',
    description: 'Learn Full-Stack Web Development through an interactive RPG quest adventure.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a', // matrix-dark
    theme_color: '#22d3ee', // matrix-neonCyan
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
