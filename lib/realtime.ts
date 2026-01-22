import { supabase } from "@/lib/supabase";

export function subscribeVoteCounts(
  eventId: string,
  onChange: (row: any) => void,
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
        if (payload.new) onChange(payload.new);
      },
    )
    .subscribe();
}
