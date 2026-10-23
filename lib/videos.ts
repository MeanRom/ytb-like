import { readdir, stat } from "node:fs/promises";
import path from "node:path";

export const DIR = path.resolve(/*turbopackIgnore: true*/ process.env.VIDEOS_DIR ?? "videos");
const EXT = new Set([".mp4", ".m4v", ".mov", ".webm", ".mkv", ".avi", ".wmv", ".flv", ".mpg", ".mpeg", ".ogv", ".3gp", ".ts"]);

export const MIME: Record<string, string> = {
  ".mp4": "video/mp4", ".m4v": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm",
  ".mkv": "video/x-matroska", ".avi": "video/x-msvideo", ".ogv": "video/ogg",
};

// Re-reads the folder on every call, so "refresh" is just calling this again.
export async function listVideos() {
  const names = await readdir(DIR).catch(() => []);
  const out = [];
  for (const name of names) {
    if (!EXT.has(path.extname(name).toLowerCase())) continue;
    const s = await stat(path.join(DIR, name));
    if (s.isFile()) out.push({ name, size: s.size, added: s.mtimeMs });
  }
  return out.sort((a, b) => b.added - a.added);
}
