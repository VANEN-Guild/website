const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Hängt den Base-Pfad an interne Pfade an. Externe URLs bleiben unverändert. */
export function url(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  return base + path;
}

/** Aktueller Pfad ohne Base-Pfad und ohne ".html", z. B. "/kontakt". */
export function currentPath(pathname: string): string {
  const path = pathname.slice(base.length).replace(/\.html$/, '').replace(/\/$/, '');
  return path || '/';
}
