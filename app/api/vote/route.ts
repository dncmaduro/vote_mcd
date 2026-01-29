import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const MAX_VOTES = Number(process.env.MAX_VOTES ?? 3); // hoặc hardcode đúng với FE

type VoteBody = {
  eventId?: string;
  eventSlug?: string;
  optionIds: string[]; // ✅ đổi thành array
  fingerprint: string;
};

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  let body: VoteBody;

  try {
    body = (await req.json()) as VoteBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const { eventId, eventSlug, optionIds, fingerprint } = body || {};

  if (!fingerprint || (!eventId && !eventSlug)) {
    return NextResponse.json(
      { message: "Missing fields: fingerprint, eventId|eventSlug" },
      { status: 400 }
    );
  }

  if (!Array.isArray(optionIds) || optionIds.length === 0) {
    return NextResponse.json({ message: "Missing field: optionIds" }, { status: 400 });
  }

  if (optionIds.length > MAX_VOTES) {
    return NextResponse.json(
      { message: `Too many selections. Max is ${MAX_VOTES}.` },
      { status: 400 }
    );
  }

  // dedupe optionIds
  const uniqOptionIds = Array.from(new Set(optionIds.filter(Boolean)));
  if (uniqOptionIds.length !== optionIds.length) {
    // nếu muốn strict thì báo lỗi, còn không thì cứ dùng uniq
    // return NextResponse.json({ message: "Duplicate optionIds" }, { status: 400 });
  }

  // resolve event
  const q = supabaseService.from("events").select("id, status").limit(1);
  const { data: event, error: eventErr } = eventId
    ? await q.eq("id", eventId).maybeSingle()
    : await q.eq("slug", eventSlug as string).maybeSingle();

  if (eventErr) return NextResponse.json({ message: eventErr.message }, { status: 500 });
  if (!event) return NextResponse.json({ message: "Event not found" }, { status: 404 });

  if (String(event.status).toLowerCase() !== "open") {
    return NextResponse.json({ message: "Voting is closed" }, { status: 403 });
  }

  // validate optionIds belong to this event
  const { data: opts, error: optErr } = await supabaseService
    .from("options")
    .select("id")
    .eq("event_id", event.id);

  if (optErr) return NextResponse.json({ message: optErr.message }, { status: 500 });

  const validSet = new Set((opts ?? []).map((o) => o.id));
  const invalid = uniqOptionIds.filter((id) => !validSet.has(id));
  if (invalid.length > 0) {
    return NextResponse.json(
      { message: "Invalid optionIds for this event", invalid },
      { status: 400 }
    );
  }

  // hash fingerprint
  const salt = process.env.VOTE_FINGERPRINT_SALT ?? "";
  const fp_hash = sha256(`${fingerprint}:${salt}`);

  // insert ONE row (trigger will update vote_counts for each option_id in option_ids)
  const { error: insErr } = await supabaseService.from("votes").insert({
    event_id: event.id,
    option_ids: uniqOptionIds, // ✅ uuid[]
    fp_hash, // ✅ theo schema hiện tại của mày
  });

  if (insErr) {
    const code = (insErr as { code?: string }).code;
    if (code === "23505") {
      return NextResponse.json({ message: "Already voted" }, { status: 409 });
    }
    return NextResponse.json({ message: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
