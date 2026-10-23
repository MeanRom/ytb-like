import { createHash, timingSafeEqual } from "node:crypto";

export const COOKIE = "auth";

// Cookie holds a hash of the password, never the password itself.
export const token = () =>
  createHash("sha256").update("yt:" + (process.env.SITE_PASSWORD ?? "")).digest("hex");

export function safeEqual(a: string, b: string) {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

export const isAuthed = (cookie?: string) =>
  !!process.env.SITE_PASSWORD && !!cookie && safeEqual(cookie, token());
