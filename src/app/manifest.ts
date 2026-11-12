import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DevQuest: The Web Matrix Chronicles',
    short_name: 'DevQuest',
    description: 'Learn Full-Stack Web Development through an interactive RPG quest adventure.',
    start_url: '/',
    id: '/',
    lang: 'en',
    dir: 'ltr',
    display: 'standalone',
    orientation: 'portrait-primary',
    scope: '/',
    background_color: '#0f172a', // matrix-dark
    theme_color: '#22d3ee', // matrix-neonCyan
    categories: ['education', 'games', 'developer tools'],
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
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'World Map',
        short_name: 'World Map',
        description: 'Explore the RPG realm world map and quest progression',
        url: '/',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Curriculum',
        short_name: 'Curriculum',
        description: 'Browse all learning modules, lessons, and curriculum tracks',
        url: '/curriculum',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Matrix IDE',
        short_name: 'Matrix IDE',
        description: 'Open the full-stack in-browser IDE and code editor',
        url: '/ide',
        icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  };
}
