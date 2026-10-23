"use client";
import { useState } from "react";

export default function Login() {
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = new FormData(e.currentTarget).get("password");
    const res = await fetch("/api/login", { method: "POST", body: JSON.stringify({ password }) });
    if (res.ok) location.href = "/";
    else setError("Wrong password");
  }
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-950 text-white">
      <form onSubmit={submit} className="flex w-80 flex-col gap-3 rounded-xl bg-zinc-900 p-6">
        <h1 className="text-xl font-semibold"><span className="text-red-500">▶</span> Enter password</h1>
        <input name="password" type="password" autoFocus required placeholder="Password"
          className="rounded-lg bg-zinc-800 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500" />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button className="rounded-lg bg-red-600 py-2 font-medium hover:bg-red-500">Enter</button>
      </form>
    </main>
  );
}
