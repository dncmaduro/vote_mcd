import { supabase } from '@/lib/supabase'

export type VoteCountRow = {
  event_id: string
  option_id: string
  count: number
}

export function subscribeVoteCounts(
  eventId: string,
  onChange: (row: VoteCountRow) => void
) {
  return supabase
    .channel(`vote_counts:${eventId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'vote_counts',
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        if (payload.new) onChange(payload.new as VoteCountRow)
      }
    )
    .subscribe()
}
