import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server env
  { auth: { persistSession: false, autoRefreshToken: false } }
);

type Body = { status: "open" | "closed" };

export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params; // ✅ IMPORTANT
  if (!eventId) return NextResponse.json({ message: "Missing eventId" }, { status: 400 });

  // check secret
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const status = body?.status;
  if (status !== "open" && status !== "closed") {
    return NextResponse.json({ message: "status must be open|closed" }, { status: 400 });
  }

  const { error } = await supabaseService
    .from("events")
    .update({ status })
    .eq("id", eventId);

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
