import { getCollection } from 'astro:content';

/** Alle veröffentlichten News, neueste zuerst. */
export async function getNews() {
  const news = await getCollection('news', ({ data }) => !data.draft);
  return news.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
