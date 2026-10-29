import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/lib/server/db";
import { getProfileById, listInbox } from "@/lib/server/repo";
import type { InboxData } from "@/lib/types";

/** The signed-in host's profile and questions. The inbox polls this. */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Sign in to see your inbox." }, { status: 401 });

  const db = getDb();
  const profile = await getProfileById(db, userId);
  const data: InboxData = { profile, questions: profile ? await listInbox(db, userId) : [] };
  return Response.json(data, { headers: { "Cache-Control": "private, no-store" } });
}
