# VANEN – Website

Statische Website für [www.vanen.info](https://www.vanen.info), gebaut mit [Astro](https://astro.build).
Bei jedem Push auf `main` baut GitHub Actions die Seite und veröffentlicht sie über GitHub Pages.

## Inhalte bearbeiten

Alle Inhalte liegen als Markdown (`.md`) oder YAML (`.yaml`) im Ordner `src/` und können direkt im
GitHub-Web-Editor bearbeitet werden. Nach ein bis zwei Minuten ist die Änderung online.

| Was | Datei |
| --- | --- |
| Name, Tagline, Discord-Link, E-Mail, Menü | `src/data/site.yaml` |
| Startseite (Begrüßungstext) | `src/content/pages/home.md` |
| Mitglieder | `src/data/members.yaml` (Einleitung: `src/content/pages/mitglieder.md`) |
| Historie (Einleitung) | `src/content/pages/historie.md` |
| Historie (ein Eintrag pro Spiel) | `src/content/history/*.md` |
| Spiele (ein Eintrag pro aktivem Spiel) | `src/content/games/*.md` (Einleitung: `src/content/pages/spiele.md`) |
| News (ein Artikel pro Datei) | `src/content/news/*.md` |
| Impressum, Datenschutz | `src/content/pages/*.md` |
| Bilder | `src/assets/img/` |

### Neue News anlegen

Neue Datei in `src/content/news/` anlegen. Der Dateiname wird zur Adresse
(`mein-artikel.md` → `/news/mein-artikel`):

```markdown
---
title: Überschrift des Artikels
date: '2026-10-21T18:00:00+02:00'
author: B3N
teaser: Kurzer Text für die Übersicht auf der Startseite.
---

Hier steht der eigentliche Artikel in **Markdown**.

## Zwischenüberschrift

- Aufzählung
- [Link](https://discord.gg/CCjSC6T)
```

Mit `draft: true` im Kopf wird ein Artikel nicht veröffentlicht.

### Mitglied eintragen

In `src/data/members.yaml` unter `members:` einen Eintrag ergänzen. Nur `name` und `role` sind Pflicht;
`role` muss eine der Gruppen unter `roles:` sein (sonst bricht der Build mit einer Fehlermeldung ab).

```yaml
  - name: B3N
    role: Leitung
    discord: b3n
    discordId: '123456789012345678'
    since: 1998
    games: [DAoC, WoW]
    bio: Kurzer Text über dich (max. 280 Zeichen).
```

Mit `discordId` wird der Discord-Name zum Link auf das Profil. Die ID findest du in Discord unter
Einstellungen → Erweitert → Entwicklermodus aktivieren, danach Rechtsklick auf den Benutzer → „Benutzer-ID kopieren“.
Bitte nur Mitglieder eintragen, die der Veröffentlichung zugestimmt haben.

### Discord-Sync

Zusätzlich zu den manuellen Einträgen holt der Build alle Discord-Mitglieder, die **sowohl** die
Mitgliedsrolle (Standard: „VANEN“) **als auch** die Opt-in-Rolle (Standard: „Website“) haben, samt Avatar.
Gäste mit „Website“, aber ohne „VANEN“ erscheinen nicht. Wer manuell in `members.yaml` steht (gleiche `discordId` oder gleicher
`discord`-Name), wird vom Sync ignoriert – so lassen sich Bio und Spiele ergänzen. Welche Discord-Rolle in welche
Gruppe kommt, steht im Block `discord:` in `members.yaml`. Der Sync läuft bei jedem Deploy und stündlich (jeweils um xx:17 UTC, GitHub startet geplante Läufe oft einige Minuten später).

Einmalig einrichten:

1. Im [Discord Developer Portal](https://discord.com/developers/applications) eine Application anlegen,
   unter **Bot** einen Token erzeugen und **Server Members Intent** aktivieren.
2. Den Bot einladen: **OAuth2 → URL Generator**, Scope `bot`, keine Berechtigungen nötig.
3. Auf dem Discord-Server die Rolle **Website** anlegen. Wer auf der Seite erscheinen möchte, nimmt sich die
   Rolle (z. B. per Reaction-Role); Rolle entfernen = Eintrag verschwindet beim nächsten Sync.
4. In GitHub unter **Settings → Secrets and variables → Actions**:
   - Secret `DISCORD_BOT_TOKEN` = Bot-Token
   - Variable `DISCORD_GUILD_ID` = Server-ID (Entwicklermodus → Rechtsklick auf den Server → „Server-ID kopieren“)
   - optional Variable `DISCORD_OPTIN_ROLE`, falls die Opt-in-Rolle anders heißt
   - optional Variable `DISCORD_MEMBER_ROLE`, falls die Mitgliedsrolle nicht „VANEN“ heißt

**Spiele und Bio für synchronisierte Mitglieder:**

- Spiele kommen automatisch aus Discord-Rollen: Unter `discord.games` in `members.yaml` steht, welche
  Discord-Rolle (z. B. per Reaction-Role vergeben) zu welchem Spiel gehört.
- Zusätzliche Spiele, eine Bio oder ein „dabei seit“-Jahr (`since`, wird sonst nicht angezeigt) lassen sich
  unter `extras:` ergänzen – Zuordnung über den Discord-Namen,
  Name, Gruppe und Avatar kommen weiterhin aus Discord:

  ```yaml
  extras:
    - discord: alice
      since: 2001
      games: [Rift]
      bio: Healer aus Leidenschaft.
  ```

Lokal testen: `.env` mit `DISCORD_BOT_TOKEN=…` und `DISCORD_GUILD_ID=…` anlegen (wird nicht committet), dann
`npm run sync:discord` und `npm run dev`. Ohne Token zeigt die Seite nur die manuellen Einträge.

### Neuer Historie-Eintrag

Neue Datei in `src/content/history/` mit `year` und `title` im Kopf. Die Einträge werden nach Jahr
absteigend sortiert; bei gleichem Jahr entscheidet `order` (kleiner = weiter oben).

### Spiele pflegen

Die Seite „Spiele“ zeigt alle Einträge aus `src/content/games/` mit `active: true`. Unter dem Kopf
folgt eine kurze Beschreibung in Markdown.

```yaml
---
title: "World of Warcraft: Forever"
logo: ./logos/wow-forever.png   # optional, Pfad relativ zur .md-Datei
active: true          # false = ausblenden
order: 0              # Reihenfolge (kleiner = weiter oben)
facts:                # beliebige Label/Wert-Paare
  - { label: Servertyp, value: Normal (PvE) }
  - { label: Fraktion, value: Allianz }
recruiting: true      # Hinweis „Wir suchen Mitspieler:innen“ mit Discord-Button
recruitingNote: Deutschsprachig, jedes Alter   # optional
news:                 # Dateinamen der News ohne .md
  - world-of-warcraft-forever
---
```

Logos kommen nach `src/content/games/logos/` – am besten PNG, WebP oder SVG mit transparentem Hintergrund.
Sie werden höchstens 5rem hoch angezeigt.

Ein falscher News-Name lässt den Build mit einer Fehlermeldung abbrechen.

## Lokale Entwicklung

Voraussetzung: Node.js 22.23 oder neuer (im CI läuft Node 24).

```sh
npm install
npm run dev      # http://localhost:4321
npm run check    # Typ- und Inhaltsprüfung
npm run build    # statische Seite nach dist/
```

## Veröffentlichung (GitHub Pages)

Einmalig im Repository: **Settings → Pages → Source: „GitHub Actions“**. Danach wird bei jedem Push auf
`main` automatisch gebaut und veröffentlicht (`.github/workflows/deploy.yml`).

Ohne weitere Einstellungen ist die Seite unter `https://<owner>.github.io/<repo>/` erreichbar.

### Eigene Domain (www.vanen.info)

1. Datei `public/CNAME` mit dem Inhalt `www.vanen.info` anlegen.
2. Unter **Settings → Secrets and variables → Actions → Variables** setzen:
   `SITE_URL` = `https://www.vanen.info` und `BASE_PATH` = `/`.
3. Beim DNS-Anbieter einen CNAME-Eintrag `www` → `<owner>.github.io` anlegen
   (für die nackte Domain `vanen.info` zusätzlich die A-Records von GitHub Pages).
4. Unter **Settings → Pages** die Domain eintragen und „Enforce HTTPS“ aktivieren.
