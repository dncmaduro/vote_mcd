export type VoteAct = {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  tags: string[];
};

export const MAX_VOTES = 3;

export const DEFAULT_VOTE_START_AT = "2026-02-07T15:00:00+07:00";

export const VOTE_ACTS: VoteAct[] = [
  {
    id: "001",
    code: "001",
    title: "Diva Bolero",
    subtitle: "Hát đơn ca — Marketing Team",
    tags: ["VOCALIST", "SOLO"],
  },
  {
    id: "004",
    code: "004",
    title: "The Fire Starters",
    subtitle: "Nhảy hiện đại — IT Division",
    tags: [],
  },
  {
    id: "012",
    code: "012",
    title: "Code & Roll",
    subtitle: "Rock Band — Engineering",
    tags: [],
  },
  {
    id: "015",
    code: "015",
    title: "Magic Minh",
    subtitle: "Ảo thuật — Sales Dept",
    tags: [],
  },
  {
    id: "018",
    code: "018",
    title: "Linh Dance",
    subtitle: "Múa đương đại — HR Team",
    tags: [],
  },
  {
    id: "021",
    code: "021",
    title: "Symphony of Hearts",
    subtitle: "Hòa tấu — Accounting",
    tags: [],
  },
  {
    id: "024",
    code: "024",
    title: "Rap Godz",
    subtitle: "Rap performance — Operations",
    tags: [],
  },
  {
    id: "028",
    code: "028",
    title: "Piano Serenity",
    subtitle: "Piano solo — Customer Care",
    tags: [],
  },
  {
    id: "030",
    code: "030",
    title: "Neon Lights",
    subtitle: "LED dance — Logistics",
    tags: [],
  },
  {
    id: "033",
    code: "033",
    title: "Acoustic Soul",
    subtitle: "Acoustic trio — Finance",
    tags: [],
  },
];

export function isVoteOpen(now = new Date()): boolean {
  const startIso =
    process.env.NEXT_PUBLIC_VOTE_START_AT ?? DEFAULT_VOTE_START_AT;
  const endIso = process.env.NEXT_PUBLIC_VOTE_END_AT;
  if (!startIso && !endIso) return true;

  const startAt = startIso ? new Date(startIso) : null;
  const endAt = endIso ? new Date(endIso) : null;
  if (startAt && Number.isNaN(startAt.getTime())) return true;
  if (endAt && Number.isNaN(endAt.getTime())) return true;

  const afterStart = startAt ? now.getTime() >= startAt.getTime() : true;
  const beforeEnd = endAt ? now.getTime() <= endAt.getTime() : true;
  return afterStart && beforeEnd;
}

export function getVoteStartAt(): Date {
  const startIso = process.env.NEXT_PUBLIC_VOTE_START_AT ?? DEFAULT_VOTE_START_AT;
  const startAt = new Date(startIso);
  if (Number.isNaN(startAt.getTime())) return new Date(DEFAULT_VOTE_START_AT);
  return startAt;
}
