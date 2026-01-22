"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { subscribeVoteCounts } from "@/lib/realtime";

type Row = {
  option_id: string;
  label?: string;
  vote_count?: number;
  count?: number;
};

export default function TestRealtimePage() {
  const eventId = process.env.NEXT_PUBLIC_TEST_EVENT_ID!;
  const optionId = process.env.NEXT_PUBLIC_TEST_OPTION_ID!;

  const [logs, setLogs] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const fpHash = useMemo(
    () => `debug_${Math.random().toString(16).slice(2)}_${Date.now()}`,
    [],
  );

  useEffect(() => {
    if (!eventId) {
      setLogs((p) => ["Missing NEXT_PUBLIC_TEST_EVENT_ID in .env.local", ...p]);
      return;
    }

    const ch = subscribeVoteCounts(eventId, (row: any) => {
      setLogs((p) => [
        `realtime: option=${row.option_id} count=${row.count}`,
        ...p,
      ]);
      setCounts((prev) => ({ ...prev, [row.option_id]: row.count }));
    });

    setLogs((p) => ["subscribed vote_counts", ...p]);

    return () => {
      ch.unsubscribe();
    };
  }, [eventId]);

  async function vote() {
    const { data, error } = await supabase.rpc("cast_vote", {
      p_event_id: eventId,
      p_option_id: optionId,
      p_fp_hash: fpHash,
    });

    if (error) setLogs((p) => [`rpc error: ${error.message}`, ...p]);
    else setLogs((p) => [`rpc ok: ${JSON.stringify(data)}`, ...p]);
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Test Realtime</h1>

      <div style={{ marginTop: 12 }}>
        <div>
          <b>eventId</b>: {eventId}
        </div>
        <div>
          <b>optionId</b>: {optionId}
        </div>
        <div>
          <b>fpHash</b>: {fpHash}
        </div>
      </div>

      <button style={{ marginTop: 12 }} onClick={vote}>
        Cast vote (RPC)
      </button>

      <h2 style={{ marginTop: 16 }}>Counts (from realtime)</h2>
      <pre>{JSON.stringify(counts, null, 2)}</pre>

      <h2 style={{ marginTop: 16 }}>Logs</h2>
      <pre>{logs.join("\n")}</pre>
    </div>
  );
}
