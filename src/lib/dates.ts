const date = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' });
const time = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });

/** z. B. "20.07.2026" */
export const formatDate = (d: Date) => date.format(d);

/** z. B. "20.07.2026, 09:37 Uhr" */
export const formatDateTime = (d: Date) => `${date.format(d)}, ${time.format(d)} Uhr`;
