import { listVideos } from "@/lib/videos";

export async function GET() {
  return Response.json(await listVideos());
}
