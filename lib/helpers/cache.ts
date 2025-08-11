import { kv } from "@vercel/kv";

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 86400
): Promise<T> {
  // COMPLETELY BYPASS CACHE FOR NOW - ALWAYS FETCH FRESH
  console.log(`CACHE BYPASSED for ${key}, fetching fresh data`);
  return await fetcher();
}