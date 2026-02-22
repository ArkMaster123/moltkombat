import { motion } from 'framer-motion';
import type { GameScreen } from '../types/game';
import { fighters } from '../data/fighters';
import { loadStats, clearStats } from '../utils/stats';
import FighterPortrait from './FighterPortrait';

interface StatsScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

export default function StatsScreen({ onNavigate }: StatsScreenProps) {
  const stats = loadStats();

  const rankedFighters = fighters
    .map((f) => ({
      fighter: f,
      stats: stats.fighterStats[f.id],
    }))
    .sort((a, b) => {
      const aWins = a.stats?.wins || 0;
      const bWins = b.stats?.wins || 0;
      return bWins - aWins;
    });

  return (
    <div className="flex flex-col h-full w-full bg-mk-black">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-mk-border">
        <button
          onClick={() => onNavigate('title')}
          className="font-[Orbitron] text-sm text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          ← BACK
        </button>
        <h2 className="font-[Orbitron] font-bold text-xl tracking-wider text-mk-gold">
          FIGHT RECORDS
        </h2>
        <button
          onClick={() => { clearStats(); window.location.reload(); }}
          className="font-[Orbitron] text-xs text-red-500/60 hover:text-red-500 transition-colors cursor-pointer"
        >
          CLEAR
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Total matches */}
        <div className="text-center mb-8">
          <span className="font-[Orbitron] text-xs text-gray-500 tracking-wider">TOTAL MATCHES</span>
          <div className="font-[Orbitron] font-black text-5xl text-white mt-1">{stats.totalMatches}</div>
        </div>

        {stats.totalMatches === 0 ? (
          <div className="text-center text-gray-600 font-[Orbitron] text-sm tracking-wider py-20">
            NO FIGHTS RECORDED YET
          </div>
        ) : (
          <>
            {/* Leaderboard */}
            <div className="max-w-2xl mx-auto">
              <h3 className="font-[Orbitron] text-xs text-gray-500 tracking-wider mb-4">LEADERBOARD</h3>
              <div className="space-y-2">
                {rankedFighters.map((entry, idx) => {
                  const s = entry.stats;
                  if (!s || (s.wins === 0 && s.losses === 0)) return null;
                  const winRate = s.wins + s.losses > 0
                    ? Math.round((s.wins / (s.wins + s.losses)) * 100)
                    : 0;

                  return (
                    <motion.div
                      key={entry.fighter.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-4 p-3 bg-mk-panel border border-mk-border rounded-sm"
                    >
                      <span className="font-[Orbitron] font-bold text-lg text-gray-600 w-8 text-center">
                        {idx + 1}
                      </span>
                      <FighterPortrait fighter={entry.fighter} size="sm" />
                      <div className="flex-1">
                        <span
                          className="font-[Orbitron] font-bold text-sm tracking-wider"
                          style={{ color: entry.fighter.color }}
                        >
                          {entry.fighter.name}
                        </span>
                        <div className="flex gap-4 mt-1 text-xs">
                          <span className="text-green-400">{s.wins}W</span>
                          <span className="text-red-400">{s.losses}L</span>
                          <span className="text-gray-500">{winRate}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">DMG DEALT</div>
                        <div className="font-[Orbitron] text-sm text-mk-gold">{s.totalDamageDealt}</div>
                      </div>
                      {s.favoriteMove && (
                        <div className="text-right hidden md:block">
                          <div className="text-xs text-gray-500">FAV MOVE</div>
                          <div className="text-xs text-white">{s.favoriteMove}</div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Recent matches */}
            {stats.recentMatches.length > 0 && (
              <div className="max-w-2xl mx-auto mt-8">
                <h3 className="font-[Orbitron] text-xs text-gray-500 tracking-wider mb-4">RECENT MATCHES</h3>
                <div className="space-y-2">
                  {stats.recentMatches.slice(0, 10).map((match, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-mk-panel/50 border border-mk-border/50 rounded-sm text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <FighterPortrait fighter={match.player1} size="xs" />
                        <span style={{ color: match.player1.color }} className="font-[Orbitron] text-xs">
                          {match.player1.name}
                        </span>
                      </div>
                      <span className="text-gray-600 font-[Orbitron] text-xs">VS</span>
                      <div className="flex items-center gap-2">
                        <span style={{ color: match.player2.color }} className="font-[Orbitron] text-xs">
                          {match.player2.name}
                        </span>
                        <FighterPortrait fighter={match.player2} size="xs" />
                      </div>
                      <span
                        className="font-[Orbitron] text-[10px] px-2 py-0.5 border rounded-sm"
                        style={{ color: match.winner.color, borderColor: match.winner.color + '40' }}
                      >
                        {match.winner.name} W
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
