import { kv } from "@vercel/kv";

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 86400
): Promise<T> {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const cached = await kv.get<T>(key);
      if (cached) {
        console.log(`Cache hit for ${key}`);
        return cached;
      }
    }
  } catch (error) {
    console.error("Cache read error:", error);
  }
  
  console.log(`Cache miss for ${key}, fetching fresh data`);
  const fresh = await fetcher();
  
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await kv.set(key, fresh, { ex: ttl });
    }
  } catch (error) {
    console.error("Cache write error:", error);
  }
  
  return fresh;
}