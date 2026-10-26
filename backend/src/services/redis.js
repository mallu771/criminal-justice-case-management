
import { createClient } from "redis";

let redisClient;

export async function getRedisClient() {
  if (!process.env.REDIS_URL) {
    console.warn("REDIS_URL is missing; caching is disabled.");
    return null;
  }

  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on("error", (error) => {
      console.error("Redis error:", error.message);
    });

    await redisClient.connect();
    console.log("Redis connected successfully.");
  }

  return redisClient;
}
