import { COOKIE, safeEqual, token } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  const real = process.env.SITE_PASSWORD;
  if (!real || typeof password !== "string" || !safeEqual(password, real))
    return new Response("Wrong password", { status: 401 });
  const res = new Response(null, { status: 204 });
  res.headers.set(
    "Set-Cookie",
    `${COOKIE}=${token()}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000`,
  );
  return res;
}
