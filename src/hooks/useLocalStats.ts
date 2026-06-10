import { previousDateId } from "../utils/date";

export type LocalStats = {
  completedDates: string[];
  currentStreak: number;
  maxStreak: number;
  lastCompletedDate?: string;
  gamesPlayed: number;
  totalCompletions: number;
  completionTimes: Record<string, number>;
};

const defaultStats: LocalStats = {
  completedDates: [],
  currentStreak: 0,
  maxStreak: 0,
  gamesPlayed: 0,
  totalCompletions: 0,
  completionTimes: {},
};

const key = "nba-crossword-stats-v1";

export function readStats(): LocalStats {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...defaultStats, ...JSON.parse(raw) } : defaultStats;
  } catch {
    return defaultStats;
  }
}

export function saveCompletion(date: string, seconds: number) {
  const stats = readStats();
  if (stats.completedDates.includes(date)) {
    return stats;
  }

  const continued = stats.lastCompletedDate === previousDateId(date);
  const currentStreak = continued ? stats.currentStreak + 1 : 1;
  const next: LocalStats = {
    completedDates: [...stats.completedDates, date].sort(),
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    lastCompletedDate: date,
    gamesPlayed: stats.gamesPlayed + 1,
    totalCompletions: stats.totalCompletions + 1,
    completionTimes: { ...stats.completionTimes, [date]: seconds },
  };
  localStorage.setItem(key, JSON.stringify(next));
  return next;
}
