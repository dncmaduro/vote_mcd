'use client'

import Image from 'next/image'
import { useMemo, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { supabase } from '@/lib/supabase'
import { subscribeVoteCounts, type VoteCountRow } from '@/lib/realtime'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'

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

type RankedRow = ResultRow & {
  rank: number // competition ranking: 1,1,3...
  showRank: boolean // only show on first row of that rank group
  accent: 'gold' | 'silver' | 'bronze' | 'neutral'
}

function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n)
}

/**
 * Competition ranking (a.k.a. "1224 ranking"):
 * If two people tie for 1st, next is 3rd. We also hide duplicated rank label.
 */
function rankRows(rows: ResultRow[]): RankedRow[] {
  // rows is assumed already sorted by votes desc
  let rank = 0
  let prevVotes: number | null = null

  return rows.map((r, idx) => {
    const isTie = prevVotes !== null && r.votes === prevVotes
    if (!isTie) {
      rank = idx + 1 // competition ranking
    }
    const showRank = !isTie
    prevVotes = r.votes

    const accent: RankedRow['accent'] =
      rank === 1
        ? 'gold'
        : rank === 2
          ? 'silver'
          : rank === 3
            ? 'bronze'
            : 'neutral'

    return { ...r, rank, showRank, accent }
  })
}

function BarItem({ row, codeLabel }: { row: RankedRow; codeLabel: string }) {
  const accent = row.accent

  const leftBadge =
    accent === 'gold'
      ? 'bg-[#ffd21f] text-[#0b1a4b] ring-[#ffd21f]/35'
      : accent === 'silver'
        ? 'bg-white/15 text-white ring-white/25'
        : accent === 'bronze'
          ? 'bg-[#ffb35c]/25 text-[#ffd7b0] ring-white/20'
          : 'bg-white/10 text-white/80 ring-white/15'

  const titleColor =
    accent === 'gold'
      ? 'text-white'
      : accent === 'silver'
        ? 'text-white'
        : accent === 'bronze'
          ? 'text-white'
          : 'text-white'

  const subColor =
    accent === 'gold'
      ? 'text-[#ffd21f]/95'
      : accent === 'silver'
        ? 'text-white/55'
        : accent === 'bronze'
          ? 'text-[#ffb35c]/70'
          : 'text-white/35'

  const pillBg =
    accent === 'gold' ? 'bg-[#ffd21f] text-[#0b1a4b]' : 'bg-white/10 text-white'

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 520, damping: 42 }}
      className={cn(
        'flex items-center justify-between gap-4 rounded-2xl px-5 py-4',
        'bg-white/10 ring-1 ring-white/12 backdrop-blur'
      )}
    >
      {/* Left: rank + title */}
      <div className="flex min-w-0 items-center gap-4">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
            'ring-1',
            leftBadge
          )}
          aria-label={`Rank ${row.rank}`}
        >
          <span className="text-2xl font-extrabold">
            {row.showRank ? row.rank : ''}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.2em] text-white/70 ring-1 ring-white/10">
              {codeLabel} {row.code}
            </span>
          </div>
          <div
            className={cn('mt-2 truncate text-2xl font-extrabold', titleColor)}
          >
            {row.title}
          </div>
          <div
            className={cn(
              'mt-1 truncate font-sans text-sm font-extrabold tracking-[0.2em] md:text-xl',
              subColor
            )}
          >
            {(row.team || '').toUpperCase()}
          </div>
        </div>
      </div>

      {/* Right: votes pill */}
      <motion.div
        key={row.votes}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 0.2 }}
        className={cn(
          'shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2',
          'ring-1 ring-white/10',
          pillBg
        )}
      >
        <span className="text-2xl font-extrabold">
          {formatNumber(row.votes)}
        </span>
      </motion.div>
    </motion.div>
  )
}

export default function ResultsPageClient() {
  const t = useTranslations('results')
  const EVENT_SLUG = 'yep2026'

  const [voteMap, setVoteMap] = useState<Record<string, number>>({})
  const [eventId, setEventId] = useState<string | null>(null)
  const [options, setOptions] = useState<
    Array<{ id: string; label: string; sort_order: number; code: string | null }>
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
      .select('id,label,sort_order,code')
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
      ;(
        data as Array<{ option_id: string; count: number | null }> | null
      )?.forEach((r) => {
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

  const rankedRows = useMemo(() => {
    const base: ResultRow[] = options
      .map((opt) => ({
        optionId: opt.id,
        code:
          (opt.code ?? '').trim() ||
          String((opt.sort_order ?? 0) + 1).padStart(3, '0'),
        title: opt.label,
        team: '', // nếu chưa có team thì để rỗng
        votes: voteMap[opt.id] ?? 0,
      }))
      .sort((a, b) => b.votes - a.votes)

    return rankRows(base)
  }, [options, voteMap])

  if (rankedRows.length === 0) {
    return <div className="p-10 text-center text-white/70">No votes yet</div>
  }

  return (
    <div className="relative min-h-screen w-full px-6 pb-28 pt-24">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <Image
          src="/background-results.png"
          alt="Results background"
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="mx-auto w-full max-w-5xl origin-top scale-105 md:scale-110">
        <div className="mb-10 text-center md:mb-12">
          <div className="mx-auto w-full max-w-3xl">
            <Image
              src="/title-results.png"
              alt={t('title')}
              width={1400}
              height={400}
              priority
              className="h-auto w-full"
            />
          </div>
        </div>

        <LayoutGroup>
          <div className="grid gap-3 md:gap-4">
            <AnimatePresence initial={false}>
              {rankedRows.map((row) => (
                <motion.div
                  key={row.optionId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 42 }}
                >
                  <BarItem row={row} codeLabel={t('codeLabel')} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 px-6 pb-6">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
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
