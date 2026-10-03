import { NextResponse } from "next/server";
import { getD1 } from "../../../db";
import { getAuth0User } from "../../auth0-user";

type EconomyBody = {
  eventId?: unknown;
  action?: unknown;
  placement?: unknown;
};

function tierFor(coins: number) {
  if (coins >= 10000) return 5;
  if (coins >= 2000) return 4;
  if (coins >= 1500) return 3;
  if (coins >= 1000) return 2;
  if (coins >= 500) return 1;
  return 0;
}

export async function POST(request: Request) {
  const user = await getAuth0User(request);
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = await request.json().catch(() => null) as EconomyBody | null;
  if (!body || typeof body.eventId !== "string" || !/^[a-zA-Z0-9-]{12,100}$/.test(body.eventId)) {
    return NextResponse.json({ error: "Invalid game event" }, { status: 400 });
  }
  if (body.action !== "finish" && body.action !== "leave") {
    return NextResponse.json({ error: "Invalid reward action" }, { status: 400 });
  }

  const placement = typeof body.placement === "number" ? Math.trunc(body.placement) : 0;
  if (body.action === "finish" && (placement < 1 || placement > 4)) {
    return NextResponse.json({ error: "Invalid placement" }, { status: 400 });
  }
  const delta = body.action === "leave" ? -500 : placement === 1 ? 100 : placement === 2 ? 50 : 0;
  const identityKey = `auth0:${user.sub}`;

  try {
    const db = getD1();
    const profile = await db.prepare("SELECT coins FROM joker_profiles WHERE identity_key = ?").bind(identityKey).first<{ coins: number }>();
    if (!profile) return NextResponse.json({ error: "Profile is not ready" }, { status: 409 });

    await db.batch([
      db.prepare("INSERT OR IGNORE INTO joker_coin_events (event_id, identity_key, action, delta, applied, created_at) VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)").bind(body.eventId, identityKey, body.action, delta),
      db.prepare("UPDATE joker_profiles SET coins = coins + ?, updated_at = CURRENT_TIMESTAMP WHERE identity_key = ? AND EXISTS (SELECT 1 FROM joker_coin_events WHERE event_id = ? AND identity_key = ? AND applied = 0)").bind(delta, identityKey, body.eventId, identityKey),
      db.prepare("UPDATE joker_coin_events SET applied = 1 WHERE event_id = ? AND identity_key = ? AND applied = 0").bind(body.eventId, identityKey),
    ]);
    const updated = await db.prepare("SELECT coins FROM joker_profiles WHERE identity_key = ?").bind(identityKey).first<{ coins: number }>();
    const coins = updated?.coins ?? profile.coins;
    return NextResponse.json({ coins, delta, tier: tierFor(coins) });
  } catch (error) {
    console.error("Coin update failed", error);
    return NextResponse.json({ error: "Coins are temporarily unavailable" }, { status: 503 });
  }
}
