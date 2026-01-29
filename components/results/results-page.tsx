"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { VOTE_ACTS } from "@/lib/vote";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type ResultRow = {
  code: string;
  title: string;
  team: string;
  votes: number;
};

const MOCK_VOTES: Record<string, number> = {
  "001": 2150,
  "004": 1240,
  "012": 980,
  "015": 856,
  "018": 720,
  "024": 645,
  "033": 512,
  "028": 480,
  "030": 422,
};

function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

function splitTeam(subtitle: string) {
  const parts = subtitle.split("—").map((x) => x.trim());
  const team = parts.length > 1 ? parts[parts.length - 1] : subtitle;
  return team;
}

function HeartPill({
  votes,
  accent,
}: {
  votes: number;
  accent: "gold" | "silver" | "bronze" | "neutral";
}) {
  const heart =
    accent === "gold"
      ? "#1f4cff"
      : accent === "silver" || accent === "bronze"
        ? "#ff4d7d"
        : "rgba(255,255,255,0.65)";

  const pill =
    accent === "gold"
      ? "bg-[#ffd21f] text-[#0b1a4b]"
      : "bg-white/10 text-white";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-5 py-2.5",
        "ring-1 ring-white/10",
        pill,
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
    </div>
  );
}

function TopCard({
  rank,
  row,
}: {
  rank: 1 | 2 | 3;
  row: ResultRow;
}) {
  const accent: "gold" | "silver" | "bronze" =
    rank === 1 ? "gold" : rank === 2 ? "silver" : "bronze";

  const size = rank === 1 ? "h-[340px] md:h-[520px]" : "h-[300px] md:h-[420px]";

  const rankColor =
    accent === "gold"
      ? "text-[#ffd21f]/28"
      : accent === "silver"
        ? "text-white/28"
        : "text-[#ffb35c]/28";

  const cardBg = rank === 1 ? "bg-white/10" : "bg-white/8";

  const teamColor =
    accent === "gold"
      ? "text-[#ffd21f]"
      : accent === "silver"
        ? "text-[#ffd21f]"
        : "text-[#ffb35c]";

  const ring =
    accent === "gold"
      ? "ring-[#ffd21f]/35"
      : accent === "silver"
        ? "ring-white/18"
        : "ring-white/18";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[44px] ring-1 ring-white/12 backdrop-blur",
        cardBg,
        ring,
        size,
      )}
    >
      <div className="relative flex h-full flex-col items-center justify-center px-8 py-10 text-center">
        {rank === 1 ? (
          <div
            className="absolute top-6 left-1/2 z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#ffd21f] text-[#0b1a4b] shadow-lg ring-1 ring-[#ffd21f]/35"
            aria-hidden="true"
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path
                d="M8 21h8M9 17h6m-8-8V4h10v5c0 3-2.5 5-5 5s-5-2-5-5Z"
                fill="currentColor"
                opacity="0.95"
              />
            </svg>
          </div>
        ) : null}

        <div
          className={cn(
            "absolute top-10 text-[120px] font-extrabold",
            rankColor,
          )}
        >
          {rank}
        </div>
        <div className={cn("mt-8 text-3xl font-extrabold tracking-tight text-white", rank === 1 ? "md:text-5xl" : "md:text-4xl")}>
          {row.title}
        </div>
        <div
          className={cn(
            "mt-3 text-xs font-bold tracking-[0.35em] md:text-sm",
            teamColor,
          )}
        >
          {row.team.toUpperCase()}
        </div>
        <div className="mt-10">
          <HeartPill votes={row.votes} accent={accent} />
        </div>
      </div>
    </div>
  );
}

function MobileWinner({ row }: { row: ResultRow }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/10 p-7 ring-1 ring-white/12 backdrop-blur">
      {/* <div className="absolute top-6 left-1/2 z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#ffd21f] text-[#0b1a4b] shadow-lg ring-1 ring-[#ffd21f]/35">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M8 21h8M9 17h6m-8-8V4h10v5c0 3-2.5 5-5 5s-5-2-5-5Z"
            fill="currentColor"
            opacity="0.95"
          />
        </svg>
      </div> */}
      <div className="absolute left-6 top-6 text-6xl font-extrabold text-[#ffd21f]/70">
        1
      </div>
      <div className="pl-14 text-left">
        <div className="text-2xl font-extrabold text-white">{row.title}</div>
        <div className="mt-1 text-xs font-bold tracking-[0.35em] text-[#f5d061]/80">
          {row.team.toUpperCase()}
        </div>
        <div className="mt-4">
          <HeartPill votes={row.votes} accent="gold" />
        </div>
      </div>
    </div>
  );
}

export default function ResultsPageClient() {
  const t = useTranslations("results");

  const rows = useMemo(() => {
    const list: ResultRow[] = VOTE_ACTS.map((act) => ({
      code: act.code,
      title: act.title,
      team: splitTeam(act.subtitle),
      votes: MOCK_VOTES[act.code] ?? 0,
    }))
      .filter((x) => x.votes > 0)
      .sort((a, b) => b.votes - a.votes);

    return list;
  }, []);

  const top1 = rows[0];
  const top2 = rows[1];
  const top3 = rows[2];
  const rest = rows.slice(3);

  if (!top1 || !top2 || !top3) return null;

  return (
    <div className="relative min-h-screen w-full px-6 pb-28 pt-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-10 text-center md:mb-12">
          <div className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            {t("title")}
          </div>
          <div className="mt-3 font-sans text-sm text-white/60 md:text-base">
            {t("subtitle")}
          </div>
        </div>

        {/* Desktop / HD */}
        <div className="hidden items-end gap-10 md:flex">
          <div className="w-[28%]">
            <TopCard rank={2} row={top2} />
          </div>
          <div className="w-[44%]">
            <TopCard rank={1} row={top1} />
          </div>
          <div className="w-[28%]">
            <TopCard rank={3} row={top3} />
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <MobileWinner row={top1} />
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="relative overflow-hidden rounded-3xl bg-white/8 p-5 ring-1 ring-white/12 backdrop-blur">
              <div className="text-5xl font-extrabold text-white/45">2</div>
              <div className="mt-2 text-base font-extrabold text-white">
                {top2.title}
              </div>
              <div className="mt-1 text-[10px] font-bold tracking-[0.35em] text-white/45">
                {top2.team.toUpperCase()}
              </div>
              <div className="mt-4">
                <HeartPill votes={top2.votes} accent="silver" />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-white/8 p-5 ring-1 ring-white/12 backdrop-blur">
              <div className="text-5xl font-extrabold text-[#ffb35c]/40">3</div>
              <div className="mt-2 text-base font-extrabold text-white">
                {top3.title}
              </div>
              <div className="mt-1 text-[10px] font-bold tracking-[0.35em] text-[#c97b2a]/70">
                {top3.team.toUpperCase()}
              </div>
              <div className="mt-4">
                <HeartPill votes={top3.votes} accent="bronze" />
              </div>
            </div>
          </div>
        </div>

        {/* Rest list */}
        <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-2 md:gap-5">
          {rest.map((row, idx) => {
            const rank = idx + 4;
            return (
              <div
                key={row.code}
                className={cn(
                  "flex items-center justify-between gap-6 rounded-2xl px-6 py-5",
                  "bg-white/8 ring-1 ring-white/12 backdrop-blur",
                )}
              >
                <div className="flex items-center gap-5">
                  <div className="w-10 text-2xl font-extrabold italic text-white/70">
                    {String(rank).padStart(2, "0")}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-lg font-extrabold text-white">
                      {row.title}
                    </div>
                    <div className="mt-1 truncate font-sans text-xs tracking-[0.22em] text-white/35">
                      {row.team.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/10">
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
                      <path
                        d="M12 21s-7.5-4.6-9.6-9.3C.8 8 3.1 5.5 6 5.5c1.8 0 3.4 1 4.2 2.4.8-1.4 2.4-2.4 4.2-2.4 2.9 0 5.2 2.5 3.6 6.2C19.5 16.4 12 21 12 21z"
                        fill="rgba(255,255,255,0.55)"
                        opacity="0.95"
                      />
                    </svg>
                    <span className="text-sm font-extrabold text-white">
                      {formatNumber(row.votes)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 px-6 pb-6">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/vote"
            className={cn(
              "flex w-full items-center justify-center gap-3 rounded-full px-10 py-5",
              "bg-black/40 text-white ring-1 ring-white/10 backdrop-blur",
              "font-sans text-sm font-extrabold tracking-[0.35em]",
            )}
          >
            <span className="text-lg">←</span>
            {t("back")}
          </Link>
        </div>
      </div>
    </div>
  );
}
