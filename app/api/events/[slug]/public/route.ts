import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params; // ✅ IMPORTANT

  if (!slug) {
    return NextResponse.json({ message: "Missing slug" }, { status: 400 });
  }

  const { data: event, error: eventErr } = await supabase
    .from("events")
    .select("id, slug, title, description, status, opens_at, closes_at")
    .eq("slug", slug)
    .maybeSingle();

  if (eventErr) return NextResponse.json({ message: eventErr.message }, { status: 500 });
  if (!event) return NextResponse.json({ message: "Event not found" }, { status: 404 });

  const { data: options, error: optErr } = await supabase
    .from("options")
    .select("id, event_id, label, sort_order")
    .eq("event_id", event.id)
    .order("sort_order", { ascending: true });

  if (optErr) return NextResponse.json({ message: optErr.message }, { status: 500 });

  const { data: counts, error: cntErr } = await supabase
    .from("vote_counts")
    .select("option_id, count")
    .eq("event_id", event.id);

  if (cntErr) return NextResponse.json({ message: cntErr.message }, { status: 500 });

  return NextResponse.json({ event, options: options ?? [], counts: counts ?? [] });
}
