import { and, asc, eq, lt, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { jokerRooms } from "../../../db/schema";

type Mode = "full" | "nines4" | "nines2";
const MODES = new Set<Mode>(["full", "nines4", "nines2"]);

function roomJson(room: typeof jokerRooms.$inferSelect) {
  return {
    id: room.id,
    code: room.code,
    name: room.name,
    visibility: room.visibility,
    mode: room.mode,
    playerCount: room.playerCount,
  };
}

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");
}

async function hashPassword(password: string, salt?: string) {
  const actualSalt = salt ?? Array.from(crypto.getRandomValues(new Uint8Array(12)), (value) => value.toString(16).padStart(2, "0")).join("");
  const bytes = new TextEncoder().encode(`${actualSalt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
  return `${actualSalt}:${hash}`;
}

async function passwordMatches(password: string, stored: string) {
  const salt = stored.split(":", 1)[0];
  return (await hashPassword(password, salt)) === stored;
}

function storageError(error: unknown) {
  const message = error instanceof Error ? error.message : "Room service unavailable";
  return Response.json({ error: message }, { status: 500 });
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(jokerRooms)
      .where(and(eq(jokerRooms.visibility, "public"), lt(jokerRooms.playerCount, 4)))
      .orderBy(asc(jokerRooms.createdAt))
      .limit(18);
    return Response.json({ rooms: rows.map(roomJson) });
  } catch (error) {
    return storageError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as {
      action?: "create" | "join";
      name?: string;
      visibility?: "private";
      mode?: Mode;
      password?: string;
      code?: string;
    };
    const db = getDb();

    if (payload.action === "create") {
      const name = payload.name?.trim().slice(0, 32) || "Joker table";
      const visibility = "private" as const;
      const mode = payload.mode && MODES.has(payload.mode) ? payload.mode : "full";
      const password = payload.password?.trim() ?? "";
      if (password.length < 4) {
        return Response.json({ error: "Private table password must have at least 4 characters." }, { status: 400 });
      }
      const passwordHash = await hashPassword(password);
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const [room] = await db.insert(jokerRooms).values({
            code: makeCode(), name, visibility, mode, passwordHash,
          }).returning();
          return Response.json({ room: roomJson(room) }, { status: 201 });
        } catch (error) {
          if (attempt === 3) throw error;
        }
      }
    }

    if (payload.action === "join") {
      const code = payload.code?.trim().toUpperCase() ?? "";
      if (!code) return Response.json({ error: "Table code is required." }, { status: 400 });
      const [room] = await db.select().from(jokerRooms).where(eq(jokerRooms.code, code)).limit(1);
      if (!room) return Response.json({ error: "Table not found." }, { status: 404 });
      if (room.visibility === "private") {
        const valid = room.passwordHash && await passwordMatches(payload.password?.trim() ?? "", room.passwordHash);
        if (!valid) return Response.json({ error: "Wrong password." }, { status: 403 });
      }
      if (room.playerCount >= 4) return Response.json({ error: "This table is full." }, { status: 409 });
      const [joined] = await db.update(jokerRooms)
        .set({ playerCount: sql`${jokerRooms.playerCount} + 1`, updatedAt: new Date().toISOString() })
        .where(and(eq(jokerRooms.id, room.id), lt(jokerRooms.playerCount, 4)))
        .returning();
      if (!joined) return Response.json({ error: "This table just became full." }, { status: 409 });
      return Response.json({ room: roomJson(joined) });
    }

    return Response.json({ error: "Unsupported room action." }, { status: 400 });
  } catch (error) {
    return storageError(error);
  }
}
