import { NextResponse } from "next/server";
import { getD1 } from "../../../db";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getAuth0User, isAuth0Configured } from "../../auth0-user";

type Provider = "google" | "facebook" | "email";

function validProvider(value: unknown): value is Provider {
  return value === "google" || value === "facebook" || value === "email";
}

async function identityKey(request: Request, provider: Provider, localProfileId: string | null) {
  const auth0User = await getAuth0User(request);
  if (auth0User) return `auth0:${auth0User.sub}`;
  if (isAuth0Configured()) return null;
  const user = await getChatGPTUser();
  if (user) return `chatgpt:${user.userId}`;
  if (!localProfileId || !/^[a-zA-Z0-9-]{16,80}$/.test(localProfileId)) return null;
  return `local:${provider}:${localProfileId}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  if (!validProvider(provider)) return NextResponse.json({ error: "Invalid profile provider" }, { status: 400 });
  const key = await identityKey(request, provider, url.searchParams.get("profile_id"));
  if (!key) return NextResponse.json({ error: "Profile identity is unavailable" }, { status: 401 });
  try {
    const row = await getD1().prepare("SELECT avatar_json, coins FROM joker_profiles WHERE identity_key = ?").bind(key).first<{ avatar_json: string; coins: number }>();
    return NextResponse.json({ avatar: row ? JSON.parse(row.avatar_json) : null, coins: row?.coins ?? 0 });
  } catch (error) {
    console.error("Profile load failed", error);
    return NextResponse.json({ error: "Profile is temporarily unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { provider?: unknown; profileId?: unknown; avatar?: unknown } | null;
  if (!body || !validProvider(body.provider) || typeof body.avatar !== "object" || body.avatar === null) return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
  const localProfileId = typeof body.profileId === "string" ? body.profileId : null;
  const key = await identityKey(request, body.provider, localProfileId);
  if (!key) return NextResponse.json({ error: "Profile identity is unavailable" }, { status: 401 });
  const avatarJson = JSON.stringify(body.avatar);
  if (avatarJson.length > 3000) return NextResponse.json({ error: "Avatar is too large" }, { status: 400 });
  try {
    await getD1().prepare("INSERT INTO joker_profiles (identity_key, provider, avatar_json, coins, updated_at) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP) ON CONFLICT(identity_key) DO UPDATE SET provider = excluded.provider, avatar_json = excluded.avatar_json, updated_at = CURRENT_TIMESTAMP").bind(key, body.provider, avatarJson).run();
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("Profile save failed", error);
    return NextResponse.json({ error: "Profile is temporarily unavailable" }, { status: 503 });
  }
}
