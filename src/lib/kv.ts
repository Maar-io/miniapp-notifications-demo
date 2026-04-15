import { MiniAppNotificationDetails } from "@farcaster/miniapp-sdk";

/**
 * In-memory notification token store
 *
 * To replace with Upstash Redis:
 *   1. Add KV_REST_API_URL and KV_REST_API_TOKEN to .env.local
 *   2. Uncomment the Redis code below and comment out the Map
 *
 * To replace with Neynar API:
 *   - No storage needed; Neynar handles token management
 */

// In-memory store (development)
const notificationTokens = new Map<
  number,
  MiniAppNotificationDetails
>();

// Redis store (uncomment to use with Upstash)
/*
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

function getUserNotificationDetailsKey(fid: number): string {
  return `frames-v2-demo:user:${fid}`;
}

export async function getUserNotificationDetails(
  fid: number
): Promise<MiniAppNotificationDetails | null> {
  return await redis.get<MiniAppNotificationDetails>(
    getUserNotificationDetailsKey(fid)
  );
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: MiniAppNotificationDetails
): Promise<void> {
  await redis.set(getUserNotificationDetailsKey(fid), notificationDetails);
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  await redis.del(getUserNotificationDetailsKey(fid));
}
*/

// In-memory store (development / Neynar-ready)
export async function getUserNotificationDetails(
  fid: number
): Promise<MiniAppNotificationDetails | null> {
  return notificationTokens.get(fid) ?? null;
}

export async function setUserNotificationDetails(
  fid: number,
  notificationDetails: MiniAppNotificationDetails
): Promise<void> {
  notificationTokens.set(fid, notificationDetails);
}

export async function deleteUserNotificationDetails(
  fid: number
): Promise<void> {
  notificationTokens.delete(fid);
}
