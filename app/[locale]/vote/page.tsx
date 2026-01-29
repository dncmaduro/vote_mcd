'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, Link } from '@/i18n/navigation'
import { supabase } from '@/lib/supabase'

type PublicEvent = {
  id: string
  slug: string
  title: string
  status: 'open' | 'closed'
}

type PublicOption = {
  id: string
  label: string
  sort_order: number
}

const MAX_VOTES = 3
const EVENT_SLUG = 'yep2026'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function getOrCreateFingerprint(): string {
  const key = 'mcd_vote_fp_v1'
  try {
    const existing = window.localStorage.getItem(key)
    if (existing) return existing
    const fp =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`
    window.localStorage.setItem(key, fp)
    return fp
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}

function ProgressRing({ value, max }: { value: number; max: number }) {
  const r = 18
  const c = 2 * Math.PI * r
  const pct = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max))
  const dash = c * pct

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
      <circle
        cx="24"
        cy="24"
        r={r}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="4"
        fill="none"
      />
      <circle
        cx="24"
        cy="24"
        r={r}
        stroke="#f5d061"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform="rotate(-90 24 24)"
      />
      <text
        x="24"
        y="28"
        textAnchor="middle"
        fontSize="12"
        fill="rgba(255,255,255,0.92)"
        fontWeight="700"
      >
        {value}/{max}
      </text>
    </svg>
  )
}

function VoteCard({
  code,
  title,
  selected,
  disabled,
  onToggle,
}: {
  code: string
  title: string
  selected: boolean
  disabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled && !selected}
      className={cn(
        'group relative w-full text-left',
        'rounded-2xl p-[1px]',
        selected ? 'bg-[#f5d061]' : 'bg-white/10',
        disabled && !selected ? 'opacity-45' : 'opacity-100',
        'transition-opacity'
      )}
      aria-pressed={selected}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl px-6 py-5',
          'bg-gradient-to-br from-[#1a1231] via-[#150c2a] to-[#0b0720]'
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#f5d061]/15 px-3 py-1 text-xs font-bold tracking-wider text-[#f5d061]">
                {`MÃ SỐ: ${code}`}
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-white">
              {title}
            </div>
          </div>

          <div className="shrink-0 pt-1">
            {selected ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5d061] text-black">
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                  <path
                    d="M20 6L9 17l-5-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : (
              <div
                className={cn(
                  'rounded-full border px-6 py-2 text-sm font-bold tracking-wider',
                  'border-[#f5d061]/35 text-[#f5d061]',
                  'group-hover:border-[#f5d061]/70'
                )}
              >
                VOTE
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

function PreVoteScreen() {
  const t = useTranslations('vote')
  return (
    <div className="relative min-h-screen w-full px-6 pb-16 pt-24">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <Image
            src="/header.png"
            alt="Year End Party 2026"
            width={1400}
            height={500}
            priority
            className="mx-auto h-auto w-full max-w-sm"
          />

          <div className="mt-10 text-2xl font-bold text-white">
            {t('pre.title')}
          </div>
          <div className="mt-4 whitespace-pre-line font-sans text-base leading-7 text-white/65">
            {t('pre.desc')}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/"
              className={cn(
                'rounded-full px-10 py-4',
                'font-sans font-bold uppercase',
                'text-sm tracking-wide',
                'text-black',
                'shadow-xl',
                'bg-gradient-to-r from-[#b8860b] via-[#f3e3bd] to-white',
                'ring-1 ring-black/10'
              )}
            >
              {t('pre.backHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VotePage() {
  const t = useTranslations('vote')
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<PublicEvent | null>(null)
  const [options, setOptions] = useState<PublicOption[]>([])
  const [error, setError] = useState<string | null>(null)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const live = event?.status === 'open'
  const maxReached = selectedIds.length >= MAX_VOTES

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/events/${EVENT_SLUG}/public`, {
          method: 'GET',
          cache: 'no-store',
        })
        const json = (await res.json().catch(() => null)) as {
          event?: PublicEvent
          options?: PublicOption[]
        } | null
        if (!res.ok || !json?.event) {
          throw new Error('Failed to load event')
        }
        if (cancelled) return
        setEvent(json.event)
        setOptions(
          (json.options ?? [])
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
        )
      } catch (e: unknown) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!event?.id) return
    const channel = supabase
      .channel(`events:${event.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${event.id}`,
        },
        (payload) => {
          const next = payload.new as Partial<PublicEvent> | null
          const nextStatus = next?.status
          if (nextStatus !== 'open' && nextStatus !== 'closed') return
          setEvent((prev) => (prev ? { ...prev, status: nextStatus } : prev))

          if (nextStatus !== 'open') {
            setSelectedIds([])
          }
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [event?.id])

  useEffect(() => {
    if (!live) setSubmitError(null)
  }, [live])

  const topCopy = useMemo(() => {
    if (selectedIds.length === 0) {
      return {
        title: t('status.zeroTitle', { max: MAX_VOTES }),
        desc: t('status.zeroDesc', { max: MAX_VOTES }),
      }
    }
    if (maxReached) {
      return {
        title: t('status.fullTitle', { max: MAX_VOTES }),
        desc: t('status.fullDesc'),
      }
    }
    return {
      title: t('status.someTitle', {
        count: selectedIds.length,
        max: MAX_VOTES,
      }),
      desc: t('status.someDesc', { remaining: MAX_VOTES - selectedIds.length }),
    }
  }, [maxReached, selectedIds.length, t])

  const acts = useMemo(() => {
    return options.map((opt, idx) => ({
      id: opt.id,
      code: String(opt.sort_order + 1 || idx + 1).padStart(2, '0'),
      title: opt.label,
    }))
  }, [options])

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_VOTES) return prev
      return [...prev, id]
    })
  }

  async function submit() {
    if (submitting) return
    setSubmitError(null)

    if (!event || event.status !== 'open') {
      setSubmitError('Voting is closed')
      return
    }
    if (selectedIds.length === 0) return

    setSubmitting(true)
    try {
      const fingerprint = getOrCreateFingerprint()

      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          optionIds: selectedIds, // ✅ Hướng A
          fingerprint,
        }),
      })

      if (res.ok) {
        router.push('/vote/thanks')
        return
      }

      if (res.status === 409) {
        // đã vote trước đó -> UX tốt: vẫn cho qua trang cảm ơn
        router.push('/vote/thanks')
        return
      }

      const json = await res.json().catch(() => ({}))

      if (res.status === 403) {
        setSubmitError('Voting is closed')
        setSelectedIds([])
        return
      }

      setSubmitError(json?.message || 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full relative min-h-screen">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <Image
          src="/background.png"
          alt="Background"
          fill
          priority
          className="object-cover"
        />
      </div>

      {loading ? (
        <div className="relative min-h-screen w-full px-6 pb-16 pt-24">
          <div className="mx-auto w-full max-w-md text-center text-white/70">
            Loading...
          </div>
        </div>
      ) : error || !event ? (
        <div className="relative min-h-screen w-full px-6 pb-16 pt-24">
          <div className="mx-auto w-full max-w-md text-center text-white/70">
            {error ?? 'Failed to load'}
          </div>
        </div>
      ) : !live ? (
        <PreVoteScreen />
      ) : (
        <div className="relative min-h-screen w-full px-6 pb-[260px] pt-24">
          <div className="mx-auto w-full max-w-md">
            <div
              className={cn(
                'fixed left-1/2 top-20 z-40 w-[min(420px,calc(100%-48px))] -translate-x-1/2',
                'rounded-3xl bg-white/6 px-6 py-5 ring-1 ring-white/10 backdrop-blur'
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xl font-bold text-white">
                    {topCopy.title}
                  </div>
                  <div className="mt-1 font-sans text-sm text-white/65">
                    {topCopy.desc}
                  </div>
                </div>
                <ProgressRing value={selectedIds.length} max={MAX_VOTES} />
              </div>
              <div className="mt-5 h-[2px] w-full bg-white/10">
                <div
                  className="h-full bg-[#f5d061]"
                  style={{
                    width: `${Math.min(100, (selectedIds.length / MAX_VOTES) * 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-36">
              <div className="space-y-5">
                {acts.map((act) => (
                  <VoteCard
                    key={act.id}
                    code={act.code}
                    title={act.title}
                    selected={selectedIds.includes(act.id)}
                    disabled={maxReached}
                    onToggle={() => toggle(act.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-40 px-6 pb-6">
            <div className="mx-auto w-full max-w-md">
              <div className="rounded-3xl bg-white/6 p-5 ring-1 ring-white/10 backdrop-blur">
                <div
                  className={cn(
                    'mb-4 flex items-center justify-center gap-2',
                    'rounded-full bg-black/35 px-5 py-3',
                    'font-sans text-sm font-semibold text-white/75',
                    'ring-1 ring-white/10'
                  )}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f5d061]/20 text-[#f5d061]">
                    i
                  </span>
                  {maxReached
                    ? t('hint.full')
                    : t('hint.remaining', {
                        remaining: MAX_VOTES - selectedIds.length,
                      })}
                </div>

                {submitError ? (
                  <div className="mb-4 rounded-2xl bg-red-500/10 px-5 py-3 text-center font-sans text-sm text-red-200 ring-1 ring-red-400/25">
                    {submitError}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={submit}
                  disabled={
                    selectedIds.length === 0 ||
                    submitting ||
                    event?.status !== 'open'
                  }
                  className={cn(
                    'w-full rounded-full px-10 py-5',
                    'font-sans font-extrabold uppercase',
                    'text-lg tracking-wider',
                    'shadow-2xl',
                    'transition-transform duration-200 active:scale-[0.98]',
                    selectedIds.length === 0 || submitting
                      ? 'cursor-not-allowed bg-white/20 text-white/35'
                      : 'bg-gradient-to-r from-[#b8860b] via-[#f3e3bd] to-white text-black hover:scale-[1.01]'
                  )}
                >
                  {submitting ? '...' : t('submit')}
                </button>

                <div className="mt-3 text-center font-sans text-xs text-white/45">
                  {selectedIds.length === 0
                    ? t('footer.needPick')
                    : t('footer.confirm')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
