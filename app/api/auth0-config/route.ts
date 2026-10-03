import { NextResponse } from "next/server";
import { auth0Config, isAuth0Configured } from "../../auth0-user";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAuth0Configured()) {
    return NextResponse.json({ error: "Authentication is being configured" }, { status: 503 });
  }
  return NextResponse.json(auth0Config(), {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
