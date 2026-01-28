import { supabase } from "@/lib/supabase";

export function subscribeVoteCounts(
  eventId: string,
  onChange: (row: Record<string, unknown>) => void,
) {
  return supabase
    .channel(`vote_counts:${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "vote_counts",
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        if (payload.new) onChange(payload.new as Record<string, unknown>);
      },
    )
    .subscribe();
}
