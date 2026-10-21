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

const member = z.object({
  name: z.string(),
  role: z.string(),
  // Discord-Benutzername, z. B. "b3n"
  discord: z.string().optional(),
  // Discord-Benutzer-ID (Entwicklermodus → Rechtsklick → „Benutzer-ID kopieren“), verlinkt das Profil
  discordId: z
    .string()
    .regex(/^\d{17,20}$/, 'discordId muss eine Discord-Benutzer-ID sein (17–20 Ziffern, in Anführungszeichen)')
    .optional(),
  since: z.number().int().min(1998).optional(),
  games: z.array(z.string()).default([]),
  bio: z.string().max(280, 'bio darf höchstens 280 Zeichen lang sein').optional(),
});

// Ergänzungen für Mitglieder aus dem Discord-Sync (Name, Gruppe und Avatar kommen weiter aus Discord)
const extra = member
  .pick({ discord: true, discordId: true, since: true, games: true, bio: true })
  .refine((e) => e.discord || e.discordId, 'Bei extras ist discord oder discordId nötig');

const members = defineCollection({
  loader: glob({ pattern: 'members.yaml', base: './src/data' }),
  schema: z
    .object({
      roles: z.array(z.string()).min(1),
      members: z.array(member).default([]),
      extras: z.array(extra).default([]),
      // Zuordnung für Mitglieder aus dem Discord-Sync
      discord: z
        .object({
          defaultRole: z.string(),
          roles: z.record(z.string(), z.array(z.string())).default({}),
          // Spiel auf der Seite → Discord-Rollennamen
          games: z.record(z.string(), z.array(z.string())).default({}),
        })
        .optional(),
    })
    .superRefine(({ roles, members, discord }, ctx) => {
      const check = (role: string, path: (string | number)[], context: string) => {
        if (!roles.includes(role)) {
          ctx.addIssue({ code: 'custom', path, message: `Unbekannte Rolle „${role}“ ${context}. Erlaubt: ${roles.join(', ')}` });
        }
      };
      members.forEach((m, i) => check(m.role, ['members', i, 'role'], `bei ${m.name}`));
      if (discord) {
        check(discord.defaultRole, ['discord', 'defaultRole'], 'in discord.defaultRole');
        Object.keys(discord.roles).forEach((role) => check(role, ['discord', 'roles', role], 'in discord.roles'));
      }
    }),
});

// Wird von scripts/sync-discord.mjs erzeugt; fehlt die Datei, gibt es nur die manuellen Einträge.
const discordMembers = defineCollection({
  loader: glob({ pattern: 'discord-members.json', base: './src/data' }),
  schema: z.object({
    syncedAt: z.string(),
    members: z.array(
      z.object({
        id: z.string(),
        username: z.string(),
        displayName: z.string(),
        roles: z.array(z.string()),
        avatar: z.boolean(),
      }),
    ),
  }),
});

export const collections = { pages, news, history, site, members, discordMembers };
