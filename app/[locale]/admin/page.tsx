"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type EventRow = {
  id: string;
  slug: string;
  title: string;
  status: string; // "open" | "closed"
  opens_at?: string | null;
  closes_at?: string | null;
};

function normalizeStatus(status: string) {
  const s = String(status || "").toLowerCase();
  if (s === "open") return "open";
  return "closed";
}

export default function AdminPage() {
  const t = useTranslations("admin");
  const [secret, setSecret] = useState("");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // per-event loading
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const canLoad = secret.trim().length > 0;

  async function loadEvents() {
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/events", {
        method: "GET",
        headers: {
          "x-admin-secret": secret.trim(),
        },
        cache: "no-store",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.message || `Load failed (${res.status})`);
      }

      const rows = (json?.events ?? []) as EventRow[];
      // sort: open first, then title
      rows.sort((a, b) => {
        const sa = normalizeStatus(a.status);
        const sb = normalizeStatus(b.status);
        if (sa !== sb) return sa === "open" ? -1 : 1;
        return (a.title || "").localeCompare(b.title || "");
      });

      setEvents(rows);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Unknown error");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(event: EventRow) {
    setErr(null);
    setUpdatingId(event.id);

    const nextStatus = normalizeStatus(event.status) === "open" ? "closed" : "open";

    try {
      const res = await fetch(`/api/admin/events/${event.id}/vote-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret.trim(),
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.message || `Update failed (${res.status})`);
      }

      setEvents((prev) =>
        prev.map((x) => (x.id === event.id ? { ...x, status: nextStatus } : x))
      );
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  }

  const baseUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  // optional: auto reload when secret changes (tắt mặc định)
  useEffect(() => {
    setErr(null);
  }, [secret]);

  return (
    <div className="w-full relative min-h-screen text-white">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <Image
          src="/background.png"
          alt={t("backgroundAlt")}
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-16 pt-28">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-white/70">{t("subtitle")}</p>
        </div>

        <div className="rounded-xl bg-white/6 p-4 ring-1 ring-white/12 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex flex-1 flex-col gap-2">
              <label className="text-sm font-medium">{t("secretLabel")}</label>
              <input
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder={t("secretPlaceholder")}
                className="w-full rounded-lg bg-black/20 px-3 py-2 outline-none ring-1 ring-white/12"
                type="password"
                autoComplete="off"
              />
              <p className="text-xs text-white/60">{t("secretHint")}</p>
            </div>

            <button
              disabled={!canLoad || loading}
              onClick={loadEvents}
              className="rounded-lg bg-white/8 px-4 py-2 text-sm font-medium ring-1 ring-white/12 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t("loading") : t("loadEvents")}
            </button>
          </div>

          {err && (
            <div className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
              {err}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white/6 ring-1 ring-white/12 backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{t("eventsTitle")}</span>
              <span className="text-xs text-white/60">
                {t("eventsTotal", { total: events.length })}
              </span>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="p-6 text-sm text-white/70">
              {t.rich("empty", {
                b: (chunks) => <b>{chunks}</b>,
              })}
            </div>
          ) : (
            <div className="p-4">
              {/* Mobile cards */}
              <div className="block space-y-3 md:hidden">
                {events.map((e) => {
                  const st = normalizeStatus(e.status);
                  return (
                    <div
                      key={e.id}
                      className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/12"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-base font-semibold">{e.title}</div>
                          <div className="mt-1 font-mono text-xs text-white/60 break-all">
                            {e.slug}
                          </div>
                          <div className="mt-2 text-xs text-white/60 break-all">
                            {e.id}
                          </div>
                        </div>

                        <span
                          className={
                            "shrink-0 inline-flex items-center rounded-full border px-2 py-1 text-xs " +
                            (st === "open"
                              ? "border-green-400/30 bg-green-500/10 text-green-200"
                              : "border-yellow-400/30 bg-yellow-500/10 text-yellow-200")
                          }
                        >
                          {st.toUpperCase()}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          disabled={updatingId === e.id}
                          onClick={() => toggleStatus(e)}
                          className="flex-1 rounded-xl bg-white/8 px-4 py-3 text-sm font-semibold ring-1 ring-white/12 disabled:opacity-50"
                        >
                          {updatingId === e.id
                            ? t("updating")
                            : st === "open"
                              ? t("closeVote")
                              : t("openVote")}
                        </button>

                        <button
                          onClick={() => copy(`${baseUrl}/vote/${e.slug}`)}
                          className="rounded-xl bg-white/8 px-4 py-3 text-sm font-semibold ring-1 ring-white/12"
                        >
                          {t("copyLink")}
                        </button>
                      </div>

                      <div className="mt-3 flex items-center gap-3 text-xs">
                        <a
                          href={`/vote/${e.slug}`}
                          className="underline text-white/80"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t("openVoteTab")}
                        </a>
                        <a
                          href={`/vote/results?slug=${encodeURIComponent(e.slug)}`}
                          className="underline text-white/80"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t("openResultsTab")}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-white/10 text-xs text-white/60">
                  <tr>
                    <th className="px-4 py-3">{t("table.title")}</th>
                    <th className="px-4 py-3">{t("table.slug")}</th>
                    <th className="px-4 py-3">{t("table.status")}</th>
                    <th className="px-4 py-3">{t("table.links")}</th>
                    <th className="px-4 py-3 text-right">{t("table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => {
                    const st = normalizeStatus(e.status);
                    const voteUrl = `${baseUrl}/vote/${e.slug}`;
                    const resultsUrl = `${baseUrl}/vote/results?slug=${encodeURIComponent(e.slug)}`;

                    return (
                      <tr key={e.id} className="border-b border-white/10 last:border-b-0">
                        <td className="px-4 py-3">
                          <div className="font-medium">{e.title}</div>
                          <div className="text-xs text-white/60">{e.id}</div>
                        </td>

                        <td className="px-4 py-3 font-mono text-xs">{e.slug}</td>

                        <td className="px-4 py-3">
                          <span
                            className={
                              "inline-flex items-center rounded-full border px-2 py-1 text-xs " +
                              (st === "open"
                                ? "border-green-400/30 bg-green-500/10 text-green-200"
                                : "border-yellow-400/30 bg-yellow-500/10 text-yellow-200")
                            }
                          >
                            {st.toUpperCase()}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <a
                                href={`/vote/${e.slug}`}
                                className="text-xs underline opacity-90"
                                target="_blank"
                                rel="noreferrer"
                              >
                                {t("openVoteTab")}
                              </a>
                              <button
                                onClick={() => copy(voteUrl)}
                                className="rounded-md bg-white/8 px-2 py-1 text-xs ring-1 ring-white/12"
                              >
                                {t("copy")}
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={`/vote/results?slug=${encodeURIComponent(e.slug)}`}
                                className="text-xs underline opacity-90"
                                target="_blank"
                                rel="noreferrer"
                              >
                                {t("openResultsTab")}
                              </a>
                              <button
                                onClick={() => copy(resultsUrl)}
                                className="rounded-md bg-white/8 px-2 py-1 text-xs ring-1 ring-white/12"
                              >
                                {t("copy")}
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            disabled={updatingId === e.id}
                            onClick={() => toggleStatus(e)}
                            className="rounded-lg bg-white/8 px-4 py-2 text-sm font-medium ring-1 ring-white/12 disabled:opacity-50"
                          >
                            {updatingId === e.id
                              ? t("updating")
                              : st === "open"
                                ? t("closeVote")
                                : t("openVote")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-white/60">
          {t("tip")} <span className="font-mono">/vote/&lt;slug&gt;</span>.
        </div>
      </div>
    </div>
  );
}
