import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { mkdir, stat } from "node:fs/promises";
import { DIR, MIME, listVideos, playable } from "@/lib/videos";

export async function GET(req: Request, ctx: RouteContext<"/api/video/[name]">) {
  const { name } = await ctx.params;
  // only serve names that the folder scan returns -> no path traversal
  const v = (await listVideos()).find((x) => x.name === decodeURIComponent(name));
  if (!v) return new Response("Not found", { status: 404 });

  let file = path.join(DIR, v.name), type = MIME[path.extname(v.name).toLowerCase()] ?? "application/octet-stream";
  if (!v.native) {
    await mkdir(path.join(DIR, ".cache"), { recursive: true });
    try { file = await playable(v.name, v.added); } catch { return new Response("Conversion failed (is ffmpeg installed?)", { status: 500 }); }
    v.size = (await stat(file)).size;
    type = "video/mp4";
  }
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range") ?? "");
  let start = 0, end = v.size - 1, status = 200;
  if (m) {
    if (m[1]) { start = +m[1]; end = m[2] ? Math.min(+m[2], end) : end; }
    else if (m[2]) start = Math.max(0, v.size - +m[2]); // suffix range
    if (start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${v.size}` } });
    status = 206;
  }
  const stream = Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream;
  return new Response(stream, {
    status,
    headers: {
      "Content-Type": type,
      "Accept-Ranges": "bytes",
      "Content-Length": String(end - start + 1),
      ...(status === 206 && { "Content-Range": `bytes ${start}-${end}/${v.size}` }),
    },
  });
}
