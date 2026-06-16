import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MuseFlow',
    short_name: 'MuseFlow',
    description: 'MuseFlow ile YouTube\'dan müzik arayın, keşfedin ve dinleyin. Sınırsız müzik kataloğunda arama yap, sonuçları listene ekle ve kesintisiz dinle.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
