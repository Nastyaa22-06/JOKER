import { getD1 } from "../../../db";

const PLACEMENTS = new Set(["lobby_week", "table_week", "sponsor_month"]);

export async function POST(request: Request) {
  try {
    const payload = await request.json() as {
      placement?: string;
      contactName?: string;
      email?: string;
      brandUrl?: string;
      message?: string;
    };
    const placement = payload.placement?.trim() ?? "";
    const contactName = payload.contactName?.trim().slice(0, 80) ?? "";
    const email = payload.email?.trim().toLowerCase().slice(0, 160) ?? "";
    const brandUrl = payload.brandUrl?.trim().slice(0, 300) || null;
    const message = payload.message?.trim().slice(0, 1200) || null;

    if (!PLACEMENTS.has(placement)) return Response.json({ error: "Choose an advertising placement." }, { status: 400 });
    if (contactName.length < 2) return Response.json({ error: "Enter your name or company name." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "Enter a valid email address." }, { status: 400 });

    const result = await getD1().prepare(`
      INSERT INTO advertising_requests (placement, contact_name, email, brand_url, message)
      VALUES (?, ?, ?, ?, ?)
    `).bind(placement, contactName, email, brandUrl, message).run();

    return Response.json({ ok: true, reference: result.meta.last_row_id }, { status: 201 });
  } catch (error) {
    console.error("Advertising request failed", error);
    return Response.json({ error: "Your request could not be sent. Please try again." }, { status: 500 });
  }
}
