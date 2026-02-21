import type { Fighter, Tournament, TournamentMatch } from '../types/game';

export function createTournament(name: string, selectedFighters: Fighter[]): Tournament {
  // Need power of 2 fighters. Pad with byes if needed.
  let count = selectedFighters.length;
  let bracketSize = 2;
  while (bracketSize < count) bracketSize *= 2;

  const fighters = [...selectedFighters];
  // Shuffle
  for (let i = fighters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fighters[i], fighters[j]] = [fighters[j], fighters[i]];
  }

  const totalRounds = Math.log2(bracketSize);
  const matches: TournamentMatch[] = [];

  // Create first round matches
  for (let i = 0; i < bracketSize / 2; i++) {
    const f1 = fighters[i * 2] || null;
    const f2 = fighters[i * 2 + 1] || null;

    // Auto-win for byes
    const isBye = !f1 || !f2;
    const winner = isBye ? (f1 || f2) : null;

    matches.push({
      id: `r1-m${i}`,
      round: 1,
      position: i,
      fighter1: f1,
      fighter2: f2,
      winner,
      result: null,
    });
  }

  // Create subsequent round placeholders
  let prevRoundMatchCount = bracketSize / 2;
  for (let round = 2; round <= totalRounds; round++) {
    const roundMatchCount = prevRoundMatchCount / 2;
    for (let i = 0; i < roundMatchCount; i++) {
      matches.push({
        id: `r${round}-m${i}`,
        round,
        position: i,
        fighter1: null,
        fighter2: null,
        winner: null,
        result: null,
      });
    }
    prevRoundMatchCount = roundMatchCount;
  }

  // Propagate byes
  propagateByes(matches, totalRounds);

  return {
    id: `tournament-${Date.now()}`,
    name,
    fighters,
    matches,
    currentMatch: findNextMatch(matches),
    isComplete: false,
  };
}

function propagateByes(matches: TournamentMatch[], totalRounds: number): void {
  for (let round = 1; round < totalRounds; round++) {
    const roundMatches = matches.filter(m => m.round === round);
    const nextRoundMatches = matches.filter(m => m.round === round + 1);

    for (let i = 0; i < roundMatches.length; i++) {
      const match = roundMatches[i];
      if (match.winner) {
        const nextMatchIdx = Math.floor(i / 2);
        const nextMatch = nextRoundMatches[nextMatchIdx];
        if (nextMatch) {
          if (i % 2 === 0) {
            nextMatch.fighter1 = match.winner;
          } else {
            nextMatch.fighter2 = match.winner;
          }
          // Auto-advance if bye in next match too
          if (nextMatch.fighter1 && !nextMatch.fighter2) {
            // Wait for other fighter
          } else if (!nextMatch.fighter1 && nextMatch.fighter2) {
            // Wait for other fighter
          }
        }
      }
    }
  }
}

export function advanceTournament(
  tournament: Tournament,
  matchId: string,
  winner: Fighter
): Tournament {
  const matches = tournament.matches.map(m => {
    if (m.id === matchId) {
      return { ...m, winner };
    }
    return m;
  });

  // Find the match that was just resolved
  const resolvedMatch = matches.find(m => m.id === matchId)!;
  const totalRounds = Math.log2(
    matches.filter(m => m.round === 1).length * 2
  );

  // Advance winner to next round
  if (resolvedMatch.round < totalRounds) {
    const nextRoundMatches = matches.filter(m => m.round === resolvedMatch.round + 1);
    const nextMatchIdx = Math.floor(resolvedMatch.position / 2);
    const nextMatch = nextRoundMatches[nextMatchIdx];

    if (nextMatch) {
      if (resolvedMatch.position % 2 === 0) {
        nextMatch.fighter1 = winner;
      } else {
        nextMatch.fighter2 = winner;
      }
    }
  }

  const nextMatchIdx = findNextMatch(matches);
  const isComplete = nextMatchIdx === -1;

  return {
    ...tournament,
    matches,
    currentMatch: nextMatchIdx,
    isComplete,
  };
}

function findNextMatch(matches: TournamentMatch[]): number {
  return matches.findIndex(m =>
    m.fighter1 !== null && m.fighter2 !== null && m.winner === null
  );
}

export function getCurrentMatch(tournament: Tournament): TournamentMatch | null {
  if (tournament.currentMatch === -1) return null;
  return tournament.matches[tournament.currentMatch] || null;
}

export function getTournamentWinner(tournament: Tournament): Fighter | null {
  if (!tournament.isComplete) return null;
  const finalMatch = tournament.matches[tournament.matches.length - 1];
  return finalMatch?.winner || null;
}
