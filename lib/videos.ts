import { execFile } from "node:child_process";
import { readdir, rename, stat } from "node:fs/promises";
import path from "node:path";

export const DIR = path.resolve(/*turbopackIgnore: true*/ process.env.VIDEOS_DIR ?? "videos");
const EXT = new Set([".mp4", ".m4v", ".mov", ".webm", ".mkv", ".avi", ".wmv", ".flv", ".mpg", ".mpeg", ".ogv", ".3gp", ".ts"]);

// Containers/codecs browsers can't play get converted to MP4 (needs ffmpeg on PATH).
export const NATIVE = new Set([".mp4", ".m4v", ".mov", ".webm", ".ogv"]);

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
    if (s.isFile()) out.push({ name, size: s.size, added: s.mtimeMs, native: NATIVE.has(path.extname(name).toLowerCase()) });
  }
  return out.sort((a, b) => b.added - a.added);
}

const jobs = new Map<string, Promise<string>>();

// Returns the path of a browser-playable MP4 for `name`, converting once and caching in videos/.cache.
// ponytail: request blocks until the whole file is converted; add background job + progress if files are huge.
export function playable(name: string, mtimeMs: number): Promise<string> {
  const out = path.join(DIR, ".cache", name + ".mp4");
  let job = jobs.get(name);
  if (!job) {
    job = stat(out).then((c) => c.mtimeMs >= mtimeMs ? out : Promise.reject()).catch(() => convert(name, out))
      .finally(() => jobs.delete(name));
    jobs.set(name, job);
  }
  return job;
}

async function convert(name: string, out: string) {
  const tmp = out + ".part.mp4";
  await new Promise<void>((ok, fail) => execFile("ffmpeg", [
    "-y", "-v", "error", "-i", path.join(DIR, name),
    "-map", "0:v:0", "-map", "0:a:0?", // first video + first audio only (drops subtitle/data tracks mp4 can't hold)
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", tmp,
  ], (e) => (e ? fail(e) : ok())));
  await rename(tmp, out);
  return out;
}
