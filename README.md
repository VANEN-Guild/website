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
| Historie (Einleitung) | `src/content/pages/historie.md` |
| Historie (ein Eintrag pro Spiel) | `src/content/history/*.md` |
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

### Neuer Historie-Eintrag

Neue Datei in `src/content/history/` mit `year` und `title` im Kopf. Die Einträge werden nach Jahr
absteigend sortiert; bei gleichem Jahr entscheidet `order` (kleiner = weiter oben).

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
