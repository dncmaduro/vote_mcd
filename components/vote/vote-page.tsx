"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  getVoteStartAt,
  isVoteOpen,
  MAX_VOTES,
  type VoteAct,
  VOTE_ACTS,
} from "@/lib/vote";

type VoteMode = "pre" | "live";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function ProgressRing({ value, max }: { value: number; max: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const pct = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));
  const dash = c * pct;

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
  );
}

function VoteCard({
  act,
  selected,
  disabled,
  onToggle,
}: {
  act: VoteAct;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled && !selected}
      className={cn(
        "group relative w-full text-left",
        "rounded-2xl p-[1px]",
        selected ? "bg-[#f5d061]" : "bg-white/10",
        disabled && !selected ? "opacity-45" : "opacity-100",
        "transition-opacity",
      )}
      aria-pressed={selected}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl px-6 py-5",
          "bg-gradient-to-br from-[#1a1231] via-[#150c2a] to-[#0b0720]",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#f5d061]/15 px-3 py-1 text-xs font-bold tracking-wider text-[#f5d061]">
                {`MÃ SỐ: ${act.code}`}
              </span>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-white">
              {act.title}
            </div>
            <div className="mt-1 font-sans text-base italic text-white/55">
              {act.subtitle}
            </div>

            {act.tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {act.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#f5d061]/30 bg-[#f5d061]/10 px-4 py-1 text-xs font-bold tracking-wide text-[#f5d061]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
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
                  "rounded-full border px-6 py-2 text-sm font-bold tracking-wider",
                  "border-[#f5d061]/35 text-[#f5d061]",
                  "group-hover:border-[#f5d061]/70",
                )}
              >
                VOTE
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function pad2(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function CountdownTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex w-[78px] flex-col items-center gap-2">
      <div className="flex h-[74px] w-full items-center justify-center rounded-2xl bg-white/6 text-3xl font-extrabold text-white ring-1 ring-white/10 backdrop-blur">
        {value}
      </div>
      <div className="font-sans text-xs font-semibold tracking-[0.25em] text-white/45">
        {label}
      </div>
    </div>
  );
}

function PreVoteScreen() {
  const t = useTranslations("vote");
  const router = useRouter();
  const startAt = useMemo(() => getVoteStartAt(), []);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const ms = Math.max(0, startAt.getTime() - now.getTime());
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  useEffect(() => {
    if (ms <= 0) router.refresh();
  }, [ms, router]);

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

          <div className="mt-10 text-sm font-bold tracking-[0.25em] text-white/80">
            {t("pre.openAfter")}
          </div>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-[#6e33ff]/70" />

          <div className="mt-10 flex items-start justify-center gap-4">
            <CountdownTile value={pad2(days)} label={t("pre.days")} />
            <CountdownTile value={pad2(hours)} label={t("pre.hours")} />
            <CountdownTile value={pad2(minutes)} label={t("pre.minutes")} />
            <CountdownTile value={pad2(seconds)} label={t("pre.seconds")} />
          </div>

          <div className="mt-14 whitespace-pre-line font-sans text-base leading-7 text-white/65">
            {t("pre.desc")}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/"
              className={cn(
                "rounded-full px-10 py-4",
                "font-sans font-bold uppercase",
                "text-sm tracking-wide",
                "text-black",
                "shadow-xl",
                "bg-gradient-to-r from-[#b8860b] via-[#f3e3bd] to-white",
                "ring-1 ring-black/10",
              )}
            >
              {t("pre.backHome")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VotePageClient({
  preview,
}: {
  preview?: VoteMode | null;
}) {
  const t = useTranslations("vote");
  const router = useRouter();

  const mode: VoteMode = useMemo(() => {
    if (preview === "pre" || preview === "live") return preview;
    return isVoteOpen() ? "live" : "pre";
  }, [preview]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const maxReached = selectedIds.length >= MAX_VOTES;

  const topCopy = useMemo(() => {
    if (selectedIds.length === 0) {
      return {
        title: t("status.zeroTitle", { max: MAX_VOTES }),
        desc: t("status.zeroDesc", { max: MAX_VOTES }),
      };
    }
    if (maxReached) {
      return {
        title: t("status.fullTitle", { max: MAX_VOTES }),
        desc: t("status.fullDesc"),
      };
    }
    return {
      title: t("status.someTitle", { count: selectedIds.length, max: MAX_VOTES }),
      desc: t("status.someDesc", { remaining: MAX_VOTES - selectedIds.length }),
    };
  }, [maxReached, selectedIds.length, t]);

  if (mode === "pre") return <PreVoteScreen />;

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_VOTES) return prev;
      return [...prev, id];
    });
  };

  const submitDisabled = selectedIds.length === 0;

  return (
    <div className="relative min-h-screen w-full px-6 pb-[260px] pt-24">
      <div className="mx-auto w-full max-w-md">
        <div
          className={cn(
            "fixed left-1/2 top-20 z-40 w-[min(420px,calc(100%-48px))] -translate-x-1/2",
            "rounded-3xl bg-white/6 px-6 py-5 ring-1 ring-white/10 backdrop-blur",
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xl font-bold text-white">{topCopy.title}</div>
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
            {VOTE_ACTS.map((act) => (
              <VoteCard
                key={act.id}
                act={act}
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
                "mb-4 flex items-center justify-center gap-2",
                "rounded-full bg-black/35 px-5 py-3",
                "font-sans text-sm font-semibold text-white/75",
                "ring-1 ring-white/10",
              )}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f5d061]/20 text-[#f5d061]">
                i
              </span>
              {maxReached
                ? t("hint.full")
                : t("hint.remaining", { remaining: MAX_VOTES - selectedIds.length })}
            </div>

            <button
              type="button"
              onClick={() => router.push("/vote/thanks")}
              disabled={submitDisabled}
              className={cn(
                "w-full rounded-full px-10 py-5",
                "font-sans font-extrabold uppercase",
                "text-lg tracking-wider",
                "shadow-2xl",
                "transition-transform duration-200 active:scale-[0.98]",
                submitDisabled
                  ? "cursor-not-allowed bg-white/20 text-white/35"
                  : "bg-gradient-to-r from-[#b8860b] via-[#f3e3bd] to-white text-black hover:scale-[1.01]",
              )}
            >
              {t("submit")}
            </button>

            <div className="mt-3 text-center font-sans text-xs text-white/45">
              {submitDisabled ? t("footer.needPick") : t("footer.confirm")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
