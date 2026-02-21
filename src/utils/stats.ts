import type { GameStats, PlayerStats, MatchResult } from '../types/game';

const STORAGE_KEY = 'mk-ai-arena-stats';
const MAX_RECENT_MATCHES = 20;

function defaultStats(): GameStats {
  return {
    totalMatches: 0,
    fighterStats: {},
    recentMatches: [],
  };
}

function defaultPlayerStats(fighterId: string): PlayerStats {
  return {
    fighterId,
    wins: 0,
    losses: 0,
    totalDamageDealt: 0,
    totalDamageReceived: 0,
    favoriteMove: '',
    moveCounts: {},
    finishersLanded: 0,
    perfectRounds: 0,
  };
}

export function loadStats(): GameStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as GameStats;
    }
  } catch {
    // corrupted data
  }
  return defaultStats();
}

export function saveStats(stats: GameStats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordMatch(result: MatchResult): GameStats {
  const stats = loadStats();
  stats.totalMatches++;

  // Update winner stats
  const winnerId = result.winner.id;
  const loserId = result.player1.id === winnerId ? result.player2.id : result.player1.id;

  if (!stats.fighterStats[winnerId]) {
    stats.fighterStats[winnerId] = defaultPlayerStats(winnerId);
  }
  if (!stats.fighterStats[loserId]) {
    stats.fighterStats[loserId] = defaultPlayerStats(loserId);
  }

  stats.fighterStats[winnerId].wins++;
  stats.fighterStats[loserId].losses++;

  // Damage stats
  const winnerDamage = result.totalDamageDealt[winnerId] || 0;
  const loserDamage = result.totalDamageDealt[loserId] || 0;
  stats.fighterStats[winnerId].totalDamageDealt += winnerDamage;
  stats.fighterStats[winnerId].totalDamageReceived += loserDamage;
  stats.fighterStats[loserId].totalDamageDealt += loserDamage;
  stats.fighterStats[loserId].totalDamageReceived += winnerDamage;

  // Move counts
  for (const [fighterId, moveCounts] of Object.entries(result.movesUsed)) {
    const fighterStats = stats.fighterStats[fighterId];
    if (fighterStats) {
      for (const [moveName, count] of Object.entries(moveCounts)) {
        fighterStats.moveCounts[moveName] = (fighterStats.moveCounts[moveName] || 0) + count;
      }
      // Update favorite move
      let maxCount = 0;
      let favMove = '';
      for (const [name, count] of Object.entries(fighterStats.moveCounts)) {
        if (count > maxCount) {
          maxCount = count;
          favMove = name;
        }
      }
      fighterStats.favoriteMove = favMove;
    }
  }

  // Recent matches
  stats.recentMatches.unshift(result);
  if (stats.recentMatches.length > MAX_RECENT_MATCHES) {
    stats.recentMatches = stats.recentMatches.slice(0, MAX_RECENT_MATCHES);
  }

  saveStats(stats);
  return stats;
}

export function clearStats(): void {
  localStorage.removeItem(STORAGE_KEY);
}
