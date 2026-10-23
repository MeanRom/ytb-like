"use client";
import { useCallback, useEffect, useState } from "react";

type Video = { name: string; size: number; added: number };

const title = (n: string) => n.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
const mb = (b: number) => (b / 1e6 >= 1000 ? (b / 1e9).toFixed(1) + " GB" : Math.round(b / 1e6) + " MB");
const src = (n: string) => `/api/video/${encodeURIComponent(n)}`;

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [playing, setPlaying] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/videos");
    if (res.status === 401) return void (location.href = "/login");
    setVideos(await res.json());
    setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div className="flex-1 bg-zinc-950 text-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-6 py-3 backdrop-blur">
        <button onClick={() => setPlaying(null)} className="text-xl font-semibold">
          <span className="text-red-500">▶</span> MyTube
        </button>
        <button onClick={refresh} disabled={loading}
          className="rounded-full bg-zinc-800 px-4 py-1.5 text-sm hover:bg-zinc-700 disabled:opacity-50">
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </header>

      {playing && (
        <section className="mx-auto max-w-5xl px-6 pt-6">
          <video key={playing.name} src={src(playing.name)} controls autoPlay className="aspect-video w-full rounded-xl bg-black" />
          <h2 className="mt-3 text-lg font-semibold">{title(playing.name)}</h2>
          <p className="text-sm text-zinc-400">{playing.name}</p>
        </section>
      )}

      <main className="grid grid-cols-1 gap-x-4 gap-y-8 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((v) => (
          <button key={v.name} onClick={() => { setPlaying(v); scrollTo({ top: 0 }); }} className="group text-left">
            <div className="aspect-video overflow-hidden rounded-xl bg-zinc-900">
              {/* #t=0.5 makes the browser render a frame as the thumbnail */}
              <video src={src(v.name) + "#t=0.5"} preload="metadata" muted className="h-full w-full object-cover transition group-hover:scale-105" />
            </div>
            <h3 className="mt-2 line-clamp-2 font-medium">{title(v.name)}</h3>
            <p className="text-sm text-zinc-400">{mb(v.size)} · {new Date(v.added).toLocaleDateString()}</p>
          </button>
        ))}
        {!loading && !videos.length && (
          <p className="col-span-full text-zinc-400">No videos found. Drop files in <code>/videos</code> and hit Refresh.</p>
        )}
      </main>
    </div>
  );
}
