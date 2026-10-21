import { getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { findImg } from './images';

export type Member = CollectionEntry<'members'>['data']['members'][number] & { avatar?: ImageMetadata };

/** Manuelle Mitglieder plus Discord-Opt-in-Mitglieder, gruppiert nach Rolle. */
export async function getMemberGroups() {
  const { roles, members: manual, extras, discord } = (await getEntry('members', 'members'))!.data;
  const synced = (await getEntry('discordMembers', 'discord-members'))?.data.members ?? [];

  // Manuell eingetragene Mitglieder werden vom Sync ignoriert
  const ids = new Set(manual.map((m) => m.discordId).filter(Boolean));
  const names = new Set(manual.map((m) => m.discord?.toLowerCase()).filter(Boolean));

  const findExtra = (d: (typeof synced)[number]) =>
    extras.find((e) => e.discordId === d.id || e.discord?.toLowerCase() === d.username.toLowerCase());

  if (synced.length > 0) {
    for (const e of extras) {
      if (!synced.some((d) => e.discordId === d.id || e.discord?.toLowerCase() === d.username.toLowerCase())) {
        console.warn(`members.yaml: extras-Eintrag „${e.discord ?? e.discordId}“ passt zu keinem Discord-Mitglied mit Opt-in-Rolle.`);
      }
    }
  }

  const fromDiscord = discord
    ? synced
        .filter((d) => !ids.has(d.id) && !names.has(d.username.toLowerCase()))
        .map((d) => {
          const extra = findExtra(d);
          const roleGames = Object.entries(discord.games)
            .filter(([, discordRoles]) => discordRoles.some((r) => d.roles.includes(r)))
            .map(([game]) => game);
          return {
            name: d.displayName,
            role:
              Object.entries(discord.roles).find(([, discordRoles]) => discordRoles.some((r) => d.roles.includes(r)))?.[0] ??
              discord.defaultRole,
            discord: d.username,
            discordId: d.id,
            since: new Date(d.joinedAt).getFullYear(),
            games: [...new Set([...(extra?.games ?? []), ...roleGames])],
            bio: extra?.bio,
          };
        })
    : [];

  // Manuelle Einträge ohne discordId übernehmen die ID aus dem Sync (für Avatar und Profil-Link)
  const idByName = new Map(synced.map((d) => [d.username.toLowerCase(), d.id]));

  const all: Member[] = [...manual, ...fromDiscord].map((m) => {
    const discordId = m.discordId ?? (m.discord ? idByName.get(m.discord.toLowerCase()) : undefined);
    return { ...m, discordId, avatar: discordId ? findImg(`discord/${discordId}.png`) : undefined };
  });

  return roles
    .map((role) => ({
      role,
      members: all.filter((m) => m.role === role).sort((a, b) => a.name.localeCompare(b.name, 'de')),
    }))
    .filter((group) => group.members.length > 0);
}
