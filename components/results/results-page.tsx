'use client'

import { useMemo, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { supabase } from '@/lib/supabase'
import { subscribeVoteCounts, type VoteCountRow } from '@/lib/realtime'
import { LayoutGroup, motion, AnimatePresence } from 'framer-motion'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

type ResultRow = {
  optionId: string
  code: string
  title: string
  team: string
  votes: number
}

function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n)
}

function HeartPill({
  votes,
  accent,
}: {
  votes: number
  accent: 'gold' | 'silver' | 'bronze' | 'neutral'
}) {
  const heart =
    accent === 'gold'
      ? '#1f4cff'
      : accent === 'silver' || accent === 'bronze'
        ? '#ff4d7d'
        : 'rgba(255,255,255,0.65)'

  const pill =
    accent === 'gold' ? 'bg-[#ffd21f] text-[#0b1a4b]' : 'bg-white/10 text-white'

  return (
    <motion.div
      key={votes} // pulse when votes changes
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ duration: 0.22 }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-5 py-2.5',
        'ring-1 ring-white/10',
        pill
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M12 21s-7.5-4.6-9.6-9.3C.8 8 3.1 5.5 6 5.5c1.8 0 3.4 1 4.2 2.4.8-1.4 2.4-2.4 4.2-2.4 2.9 0 5.2 2.5 3.6 6.2C19.5 16.4 12 21 12 21z"
          fill={heart}
          opacity="0.95"
        />
      </svg>
      <span className="text-lg font-extrabold">{formatNumber(votes)}</span>
    </motion.div>
  )
}

function TopCard({ rank, row }: { rank: 1 | 2 | 3; row: ResultRow }) {
  const accent: 'gold' | 'silver' | 'bronze' =
    rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze'

  const size = rank === 1 ? 'h-[340px] md:h-[560px]' : 'h-[300px] md:h-[440px]'

  const rankColor =
    accent === 'gold'
      ? 'text-[#ffd21f]/90'
      : accent === 'silver'
        ? 'text-white/28'
        : 'text-[#ffb35c]/28'

  const rankTop = accent === 'gold' ? 'top-10 md:-top-4' : 'top-8 md:top-6'

  const cardBg = rank === 1 ? 'bg-white/10' : 'bg-white/8'

  const teamColor =
    accent === 'gold'
      ? 'text-[#ffd21f]'
      : accent === 'silver'
        ? 'text-[#ffd21f]'
        : 'text-[#ffb35c]'

  const ring =
    accent === 'gold'
      ? 'ring-[#ffd21f]/35'
      : accent === 'silver'
        ? 'ring-white/18'
        : 'ring-white/18'

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 520, damping: 42 }}
      className={cn(
        'relative overflow-hidden rounded-[44px] ring-1 ring-white/12 backdrop-blur',
        cardBg,
        ring,
        size
      )}
    >
      <div className="relative flex h-full flex-col items-center justify-center px-8 py-10 text-center md:px-10 md:py-12">
        <div
          className={cn(
            `${rankTop} text-[96px] font-extrabold md:text-[140px]`,
            rankColor
          )}
        >
          {rank}
        </div>
        <div
          className={cn(
            'mt-8 text-3xl font-extrabold tracking-tight text-white',
            rank === 1 ? 'md:text-5xl' : 'md:text-4xl'
          )}
        >
          {row.title}
        </div>
        <div
          className={cn(
            'mt-3 text-xs font-bold tracking-[0.35em] md:text-sm',
            teamColor
          )}
        >
          {(row.team || '').toUpperCase()}
        </div>
        <div className="mt-10">
          <HeartPill votes={row.votes} accent={accent} />
        </div>
      </div>
    </motion.div>
  )
}

function MobileWinner({ row }: { row: ResultRow }) {
  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 520, damping: 42 }}
      className="relative overflow-hidden rounded-3xl bg-white/10 p-7 ring-1 ring-white/12 backdrop-blur"
    >
      <div className="absolute left-6 top-6 text-6xl font-extrabold text-[#ffd21f]/70">
        1
      </div>
      <div className="pl-14 text-left">
        <div className="text-2xl font-extrabold text-white">{row.title}</div>
        <div className="mt-1 text-xs font-bold tracking-[0.35em] text-[#f5d061]/80">
          {(row.team || '').toUpperCase()}
        </div>
        <div className="mt-4">
          <HeartPill votes={row.votes} accent="gold" />
        </div>
      </div>
    </motion.div>
  )
}

export default function ResultsPageClient() {
  const t = useTranslations('results')
  const EVENT_SLUG = 'yep2026'

  const [voteMap, setVoteMap] = useState<Record<string, number>>({})
  const [eventId, setEventId] = useState<string | null>(null)
  const [options, setOptions] = useState<
    Array<{ id: string; label: string; sort_order: number }>
  >([])

  // get eventId by slug
  useEffect(() => {
    let cancelled = false

    async function run() {
      const { data, error } = await supabase
        .from('events')
        .select('id')
        .eq('slug', EVENT_SLUG)
        .maybeSingle()

      if (cancelled) return
      if (error || !data?.id) {
        setEventId(null)
        return
      }
      setEventId(data.id)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  // load options
  useEffect(() => {
    if (!eventId) return

    supabase
      .from('options')
      .select('id,label,sort_order')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true })
      .then(({ data }) => setOptions(data ?? []))
  }, [eventId])

  // initial vote_counts snapshot
  useEffect(() => {
    if (!eventId) return

    let cancelled = false

    async function run() {
      const { data, error } = await supabase
        .from('vote_counts')
        .select('option_id, count')
        .eq('event_id', eventId)

      if (cancelled) return
      if (error) return

      const map: Record<string, number> = {}
      ;(data ?? []).forEach((r: any) => {
        map[r.option_id] = Number(r.count ?? 0)
      })
      setVoteMap(map)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [eventId])

  // realtime updates
  useEffect(() => {
    if (!eventId) return

    const channel = subscribeVoteCounts(eventId, (row: VoteCountRow) => {
      setVoteMap((prev) => ({
        ...prev,
        [row.option_id]: Number(row.count ?? 0),
      }))
    })

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [eventId])

  const rows = useMemo(() => {
    const list: ResultRow[] = options
      .map((opt) => ({
        optionId: opt.id,
        code: String((opt.sort_order ?? 0) + 1).padStart(3, '0'),
        title: opt.label,
        team: '', // nếu chưa có team thì để rỗng
        votes: voteMap[opt.id] ?? 0,
      }))
      .sort((a, b) => b.votes - a.votes)

    return list
  }, [options, voteMap])

  // safe fallback to avoid crash when < 3 options
  const safe = (r?: ResultRow): ResultRow =>
    r ?? { optionId: 'na', code: '', title: '—', team: '', votes: 0 }

  const top1 = safe(rows[0])
  const top2 = safe(rows[1])
  const top3 = safe(rows[2])
  const rest = rows.slice(3)

  if (rows.length === 0) {
    return <div className="p-10 text-center text-white/70">No votes yet</div>
  }

  return (
    <div className="relative min-h-screen w-full px-6 pb-28 pt-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10 text-center md:mb-12">
          <div className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            {t('title')}
          </div>
          <div className="mt-3 font-sans text-sm text-white/60 md:text-base">
            {t('subtitle')}
          </div>
        </div>

        <LayoutGroup>
          {/* Desktop / HD */}
          {rows.length >= 3 ? (
            <div className="hidden md:grid md:grid-cols-12 md:items-end md:gap-10">
              <motion.div layout className="col-span-4">
                <TopCard rank={2} row={top2} />
              </motion.div>

              <motion.div layout className="col-span-4">
                <TopCard rank={1} row={top1} />
              </motion.div>

              <motion.div layout className="col-span-4">
                <TopCard rank={3} row={top3} />
              </motion.div>
            </div>
          ) : (
            // if fewer than 3, just show a single big winner on desktop too
            <div className="hidden md:block">
              <TopCard rank={1} row={top1} />
            </div>
          )}

          {/* Mobile */}
          <div className="md:hidden">
            <MobileWinner row={top1} />

            {rows.length >= 3 && (
              <motion.div layout className="mt-5 grid grid-cols-2 gap-4">
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 520, damping: 42 }}
                  className="relative overflow-hidden rounded-3xl bg-white/8 p-5 ring-1 ring-white/12 backdrop-blur"
                >
                  <div className="text-5xl font-extrabold text-white/45">2</div>
                  <div className="mt-2 text-base font-extrabold text-white">
                    {top2.title}
                  </div>
                  <div className="mt-1 text-[10px] font-bold tracking-[0.35em] text-white/45">
                    {(top2.team || '').toUpperCase()}
                  </div>
                  <div className="mt-4">
                    <HeartPill votes={top2.votes} accent="silver" />
                  </div>
                </motion.div>

                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 520, damping: 42 }}
                  className="relative overflow-hidden rounded-3xl bg-white/8 p-5 ring-1 ring-white/12 backdrop-blur"
                >
                  <div className="text-5xl font-extrabold text-[#ffb35c]/40">
                    3
                  </div>
                  <div className="mt-2 text-base font-extrabold text-white">
                    {top3.title}
                  </div>
                  <div className="mt-1 text-[10px] font-bold tracking-[0.35em] text-[#c97b2a]/70">
                    {(top3.team || '').toUpperCase()}
                  </div>
                  <div className="mt-4">
                    <HeartPill votes={top3.votes} accent="bronze" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Rest list */}
          <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-2 md:gap-5">
            <AnimatePresence initial={false}>
              {rest.map((row, idx) => {
                const rank = idx + 4
                return (
                  <motion.div
                    key={row.optionId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 42 }}
                    className={cn(
                      'flex items-center justify-between gap-6 rounded-2xl px-6 py-5',
                      'bg-white/8 ring-1 ring-white/12 backdrop-blur'
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-10 text-2xl font-extrabold italic text-white/70">
                        {String(rank).padStart(2, '0')}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-lg font-extrabold text-white">
                          {row.title}
                        </div>
                        <div className="mt-1 truncate font-sans text-xs tracking-[0.22em] text-white/35">
                          {(row.team || '').toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <motion.div
                        key={row.votes} // subtle pulse on count change
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/10"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path
                            d="M12 21s-7.5-4.6-9.6-9.3C.8 8 3.1 5.5 6 5.5c1.8 0 3.4 1 4.2 2.4.8-1.4 2.4-2.4 4.2-2.4 2.9 0 5.2 2.5 3.6 6.2C19.5 16.4 12 21 12 21z"
                            fill="rgba(255,255,255,0.55)"
                            opacity="0.95"
                          />
                        </svg>
                        <span className="text-sm font-extrabold text-white">
                          {formatNumber(row.votes)}
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 px-6 pb-6">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/vote"
            className={cn(
              'flex w-full items-center justify-center gap-3 rounded-full px-10 py-5',
              'bg-black/40 text-white ring-1 ring-white/10 backdrop-blur',
              'font-sans text-sm font-extrabold tracking-[0.35em]'
            )}
          >
            <span className="text-lg">←</span>
            {t('back')}
          </Link>
        </div>
      </div>
    </div>
  )
}
