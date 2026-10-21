import type { ImageMetadata } from 'astro';

const images = import.meta.glob<{ default: ImageMetadata }>('/src/assets/img/**/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
});

/** Lädt ein Bild aus src/assets/img, z. B. img('team/philip-zell.jpg'). */
export function img(path: string): ImageMetadata {
  const mod = images[`/src/assets/img/${path}`];
  if (!mod) throw new Error(`Bild nicht gefunden: src/assets/img/${path}`);
  return mod.default;
}

/** Wie img(), gibt aber undefined zurück, wenn das Bild fehlt. */
export function findImg(path: string): ImageMetadata | undefined {
  return images[`/src/assets/img/${path}`]?.default;
}
