import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    heading: z.string().optional(),
    subtitle: z.string().optional(),
  }),
});

const news = defineCollection({
  // Dateiname = URL, z. B. src/content/news/mein-artikel.md → /news/mein-artikel
  loader: glob({ pattern: '*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    // Format: 2026-07-20T09:37 (Uhrzeit optional)
    date: z.coerce.date(),
    author: z.string().default('B3N'),
    teaser: z.string(),
    draft: z.boolean().default(false),
  }),
});

const history = defineCollection({
  // Ein Eintrag pro Spiel; sortiert wird absteigend nach "year", danach nach "order"
  loader: glob({ pattern: '*.md', base: './src/content/history' }),
  schema: z.object({
    year: z.number(),
    title: z.string(),
    order: z.number().default(0),
  }),
});

const site = defineCollection({
  loader: glob({ pattern: 'site.yaml', base: './src/data' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    email: z.string(),
    discord: z.url(),
    nav: z.array(z.object({ label: z.string(), href: z.string() })),
    footerNav: z.array(z.object({ label: z.string(), href: z.string() })),
  }),
});

export const collections = { pages, news, history, site };
