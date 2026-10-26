
import { getRedisClient } from "./redis.js";

export async function getCached(key) {
  const redis = await getRedisClient();

  if (!redis) {
    console.log("Redis caching disabled: REDIS_URL missing");
    return null;
  }

  const value = await redis.get(key);
  console.log("Redis GET:", key, value ? "CACHE HIT" : "CACHE MISS");

  return value ? JSON.parse(value) : null;
}

export async function setCached(key, value, ttl = 30) {
  const redis = await getRedisClient();

  if (!redis) return;

  await redis.set(key, JSON.stringify(value), { EX: ttl });
  console.log("Redis SET:", key, "TTL:", ttl);
}

export async function deleteCache(key) {
  const redis = await getRedisClient();
  if (!redis) return;

  await redis.del(key);
  console.log("Redis DELETE:", key);
}
