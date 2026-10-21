// Holt alle Discord-Mitglieder mit der Opt-in-Rolle und lädt ihre Avatare herunter.
// Ergebnis: src/data/discord-members.json und src/assets/img/discord/<id>.png (beides nicht im Repo).
//
// Umgebung:
//   DISCORD_BOT_TOKEN   Bot-Token (ohne Token wird der Sync übersprungen)
//   DISCORD_GUILD_ID    ID des Discord-Servers
//   DISCORD_OPTIN_ROLE  Name oder ID der Opt-in-Rolle (Standard: Website)
import { mkdir, rm, writeFile } from 'node:fs/promises';

const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;
const optInRole = process.env.DISCORD_OPTIN_ROLE || 'Website';
const api = process.env.DISCORD_API_BASE || 'https://discord.com/api/v10';
const cdn = process.env.DISCORD_CDN_BASE || 'https://cdn.discordapp.com';

const dataFile = new URL('../src/data/discord-members.json', import.meta.url);
const avatarDir = new URL('../src/assets/img/discord/', import.meta.url);

if (!token || !guildId) {
  console.log('Discord-Sync übersprungen: DISCORD_BOT_TOKEN oder DISCORD_GUILD_ID nicht gesetzt.');
  process.exit(0);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(url, { json = true } = {}) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: { Authorization: `Bot ${token}` } });
    if (res.status === 429 && attempt <= 5) {
      const body = await res.json().catch(() => ({}));
      const wait = Math.ceil((body.retry_after ?? 1) * 1000);
      console.log(`Rate-Limit erreicht, warte ${wait} ms …`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} bei ${url}`);
    return json ? res.json() : Buffer.from(await res.arrayBuffer());
  }
}

async function fetchMembers() {
  const members = [];
  let after = '0';
  for (;;) {
    const page = await request(`${api}/guilds/${guildId}/members?limit=1000&after=${after}`);
    members.push(...page);
    if (page.length < 1000) return members;
    after = page[page.length - 1].user.id;
  }
}

function avatarUrl(member) {
  const { user } = member;
  if (member.avatar) return `${cdn}/guilds/${guildId}/users/${user.id}/avatars/${member.avatar}.png?size=128`;
  if (user.avatar) return `${cdn}/avatars/${user.id}/${user.avatar}.png?size=128`;
  return undefined;
}

try {
  const roles = await request(`${api}/guilds/${guildId}/roles`);
  const roleNames = new Map(roles.map((r) => [r.id, r.name]));
  const optIn = roles.find((r) => r.id === optInRole || r.name.toLowerCase() === optInRole.toLowerCase());
  if (!optIn) throw new Error(`Opt-in-Rolle „${optInRole}“ gibt es auf dem Server nicht.`);

  const all = await fetchMembers();
  const selected = all.filter((m) => !m.user.bot && m.roles.includes(optIn.id));

  await rm(avatarDir, { recursive: true, force: true });
  await mkdir(avatarDir, { recursive: true });

  const members = [];
  for (const m of selected) {
    const url = avatarUrl(m);
    let avatar = false;
    if (url) {
      try {
        await writeFile(new URL(`${m.user.id}.png`, avatarDir), await request(url, { json: false }));
        avatar = true;
      } catch (err) {
        console.warn(`Avatar von ${m.user.username} nicht geladen: ${err.message}`);
      }
    }
    members.push({
      id: m.user.id,
      username: m.user.username,
      displayName: m.nick || m.user.global_name || m.user.username,
      roles: m.roles.filter((id) => id !== optIn.id).map((id) => roleNames.get(id)).filter(Boolean),
      avatar,
    });
  }

  await writeFile(dataFile, JSON.stringify({ syncedAt: new Date().toISOString(), members }, null, 2) + '\n');
  console.log(`Discord-Sync: ${members.length} von ${all.length} Mitgliedern mit Rolle „${optIn.name}“ übernommen.`);
} catch (err) {
  console.error(`Discord-Sync fehlgeschlagen: ${err.message}`);
  process.exit(1);
}
