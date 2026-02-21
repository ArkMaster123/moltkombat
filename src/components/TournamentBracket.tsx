import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Fighter, Tournament, MatchResult, GameScreen } from '../types/game';
import { fighters } from '../data/fighters';
import { createTournament, advanceTournament, getCurrentMatch, getTournamentWinner } from '../utils/tournament';
import BattleArena from './BattleArena';

interface TournamentBracketProps {
  onNavigate: (screen: GameScreen) => void;
}

type TournamentPhase = 'setup' | 'bracket' | 'fighting' | 'complete';

export default function TournamentBracket({ onNavigate }: TournamentBracketProps) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [phase, setPhase] = useState<TournamentPhase>('setup');

  function handleStartTournament() {
    const t = createTournament('AI CHAMPIONSHIP', fighters);
    setTournament(t);
    setPhase('bracket');
  }

  function handleStartMatch() {
    setPhase('fighting');
  }

  const handleMatchEnd = useCallback((result: MatchResult) => {
    if (!tournament) return;

    const currentMatch = getCurrentMatch(tournament);
    if (!currentMatch) return;

    const updated = advanceTournament(tournament, currentMatch.id, result.winner);
    setTournament(updated);

    if (updated.isComplete) {
      setPhase('complete');
    } else {
      setPhase('bracket');
    }
  }, [tournament]);

  if (phase === 'setup') {
    return <TournamentSetup onStart={handleStartTournament} onBack={() => onNavigate('title')} />;
  }

  if (phase === 'fighting' && tournament) {
    const currentMatch = getCurrentMatch(tournament);
    if (currentMatch?.fighter1 && currentMatch?.fighter2) {
      return (
        <BattleArena
          player1={currentMatch.fighter1}
          player2={currentMatch.fighter2}
          onMatchEnd={handleMatchEnd}
          onBack={() => setPhase('bracket')}
        />
      );
    }
  }

  if (phase === 'complete' && tournament) {
    const champion = getTournamentWinner(tournament);
    return (
      <TournamentComplete
        champion={champion}
        tournament={tournament}
        onNavigate={onNavigate}
      />
    );
  }

  // Bracket view
  return tournament ? (
    <BracketView
      tournament={tournament}
      onStartMatch={handleStartMatch}
      onBack={() => onNavigate('title')}
    />
  ) : null;
}

function TournamentSetup({ onStart, onBack }: { onStart: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-mk-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="font-[Orbitron] font-black text-4xl text-mk-gold tracking-wider mb-2">
          TOURNAMENT
        </h2>
        <p className="text-gray-500 text-sm mb-8">8 AI Models. One Champion.</p>

        <div className="grid grid-cols-4 gap-3 mb-10 max-w-lg mx-auto">
          {fighters.map((f) => (
            <div key={f.id} className="flex flex-col items-center p-3 bg-mk-panel border border-mk-border rounded-sm">
              <span className="text-3xl">{f.avatar}</span>
              <span className="font-[Orbitron] text-[10px] mt-1 tracking-wider" style={{ color: f.color }}>
                {f.name}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="font-[Orbitron] font-bold text-lg px-10 py-4 border-2 border-mk-red text-mk-red
              hover:bg-mk-red hover:text-white transition-all cursor-pointer"
          >
            BEGIN TOURNAMENT
          </motion.button>
          <button
            onClick={onBack}
            className="font-[Orbitron] text-sm px-6 py-4 border border-mk-border text-gray-500
              hover:text-white transition-colors cursor-pointer"
          >
            BACK
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function BracketView({
  tournament,
  onStartMatch,
  onBack,
}: {
  tournament: Tournament;
  onStartMatch: () => void;
  onBack: () => void;
}) {
  const currentMatch = getCurrentMatch(tournament);
  const rounds = new Map<number, typeof tournament.matches>();
  for (const match of tournament.matches) {
    if (!rounds.has(match.round)) rounds.set(match.round, []);
    rounds.get(match.round)!.push(match);
  }

  const roundEntries = Array.from(rounds.entries()).sort((a, b) => a[0] - b[0]);

  return (
    <div className="flex flex-col h-full w-full bg-mk-black">
      <div className="flex items-center justify-between px-6 py-4 border-b border-mk-border">
        <button onClick={onBack} className="font-[Orbitron] text-sm text-gray-500 hover:text-white transition-colors cursor-pointer">
          ← BACK
        </button>
        <h2 className="font-[Orbitron] font-bold text-xl tracking-wider text-mk-gold">
          {tournament.name}
        </h2>
        <div />
      </div>

      <div className="flex-1 flex items-center justify-center overflow-x-auto p-6 gap-4">
        {roundEntries.map(([roundNum, matches]) => (
          <div key={roundNum} className="flex flex-col items-center gap-4">
            <span className="font-[Orbitron] text-[10px] text-gray-500 tracking-wider mb-2">
              {roundNum === roundEntries.length ? 'FINAL' : `ROUND ${roundNum}`}
            </span>
            {matches.map((match) => {
              const isCurrent = currentMatch?.id === match.id;
              return (
                <div
                  key={match.id}
                  className={`
                    w-52 border rounded-sm overflow-hidden
                    ${isCurrent ? 'border-mk-gold ring-1 ring-mk-gold/30' : 'border-mk-border'}
                    ${match.winner ? 'bg-mk-panel/30' : 'bg-mk-panel'}
                  `}
                >
                  <MatchSlot
                    fighter={match.fighter1}
                    isWinner={match.winner?.id === match.fighter1?.id}
                    isLoser={!!match.winner && match.winner.id !== match.fighter1?.id}
                  />
                  <div className="h-px bg-mk-border" />
                  <MatchSlot
                    fighter={match.fighter2}
                    isWinner={match.winner?.id === match.fighter2?.id}
                    isLoser={!!match.winner && match.winner.id !== match.fighter2?.id}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Current match action */}
      {currentMatch && (
        <div className="border-t border-mk-border bg-mk-dark/80 p-4 text-center">
          <p className="font-[Orbitron] text-xs text-gray-500 tracking-wider mb-3">
            NEXT MATCH: {currentMatch.fighter1?.name} vs {currentMatch.fighter2?.name}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStartMatch}
            className="font-[Orbitron] font-bold px-8 py-3 border-2 border-mk-red text-mk-red
              hover:bg-mk-red hover:text-white transition-all cursor-pointer"
          >
            START FIGHT
          </motion.button>
        </div>
      )}
    </div>
  );
}

function MatchSlot({
  fighter,
  isWinner,
  isLoser,
}: {
  fighter: Fighter | null;
  isWinner: boolean;
  isLoser: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 text-sm ${
        isWinner ? 'bg-green-900/20' : isLoser ? 'opacity-40' : ''
      }`}
    >
      {fighter ? (
        <>
          <span className="text-lg">{fighter.avatar}</span>
          <span
            className="font-[Orbitron] text-xs tracking-wider flex-1"
            style={{ color: fighter.color }}
          >
            {fighter.name}
          </span>
          {isWinner && <span className="text-green-400 text-xs">W</span>}
          {isLoser && <span className="text-red-400 text-xs">L</span>}
        </>
      ) : (
        <span className="text-gray-600 text-xs font-[Orbitron] tracking-wider">TBD</span>
      )}
    </div>
  );
}

function TournamentComplete({
  champion,
  tournament,
  onNavigate,
}: {
  champion: Fighter | null;
  tournament: Tournament;
  onNavigate: (screen: GameScreen) => void;
}) {
  if (!champion) return null;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-mk-black relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${champion.color}20 0%, transparent 70%)`,
        }}
      />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'backOut' }}
        className="relative z-10 text-center"
      >
        <span className="font-[Orbitron] text-sm tracking-[0.3em] text-mk-gold block mb-4">
          TOURNAMENT CHAMPION
        </span>
        <div className="text-9xl mb-4" style={{ filter: `drop-shadow(0 0 40px ${champion.color})` }}>
          {champion.avatar}
        </div>
        <h2
          className="font-[Orbitron] font-black text-6xl tracking-wider mb-2"
          style={{ color: champion.color, textShadow: `0 0 50px ${champion.color}40` }}
        >
          {champion.name}
        </h2>
        <p className="text-gray-400 italic mb-8">{champion.subtitle}</p>

        <p className="text-mk-gold text-xs font-[Orbitron] tracking-wider mb-2">
          DEFEATED {tournament.fighters.length - 1} OPPONENTS
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('tournament')}
            className="font-[Orbitron] font-bold text-sm px-8 py-3 border-2 border-mk-gold text-mk-gold
              hover:bg-mk-gold hover:text-black transition-all cursor-pointer"
          >
            NEW TOURNAMENT
          </motion.button>
          <button
            onClick={() => onNavigate('title')}
            className="font-[Orbitron] text-sm px-8 py-3 border border-mk-border text-gray-400
              hover:border-white hover:text-white transition-all cursor-pointer"
          >
            MAIN MENU
          </button>
        </div>
      </motion.div>
    </div>
  );
}
