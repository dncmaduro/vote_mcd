import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // server env
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function GET(req: Request) {
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseService
    .from("events")
    .select("id, slug, title, status, opens_at, closes_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  return NextResponse.json({ events: data ?? [] });
}
