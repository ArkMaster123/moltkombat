import { motion } from 'framer-motion';
import type { MatchResult, GameScreen } from '../types/game';
import { getWinQuote, getLoseQuote } from '../utils/combat';

interface ResultScreenProps {
  result: MatchResult;
  onNavigate: (screen: GameScreen) => void;
}

export default function ResultScreen({ result, onNavigate }: ResultScreenProps) {
  const { winner, player1, player2 } = result;
  const loser = winner.id === player1.id ? player2 : player1;

  const winnerDamage = result.totalDamageDealt[winner.id] || 0;
  const loserDamage = result.totalDamageDealt[loser.id] || 0;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-mk-black relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${winner.color}15 0%, transparent 70%)`,
        }}
      />

      {/* Winner announcement */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'backOut' }}
        className="relative z-10 text-center mb-8"
      >
        <motion.span
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-[Orbitron] text-sm tracking-[0.3em] text-gray-500 block mb-2"
        >
          WINNER
        </motion.span>
        <div className="text-8xl mb-4" style={{ filter: `drop-shadow(0 0 30px ${winner.color})` }}>
          {winner.avatar}
        </div>
        <h2
          className="font-[Orbitron] font-black text-5xl md:text-6xl tracking-wider"
          style={{ color: winner.color, textShadow: `0 0 40px ${winner.color}40` }}
        >
          {winner.name}
        </h2>
        <p className="text-gray-400 italic mt-2">{winner.subtitle}</p>
      </motion.div>

      {/* Win quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 max-w-md text-center mb-8"
      >
        <p className="text-mk-gold italic text-lg">"{getWinQuote(winner)}"</p>
        <p className="text-gray-600 italic text-sm mt-2">"{getLoseQuote(loser)}" — {loser.name}</p>
      </motion.div>

      {/* Stats comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="relative z-10 flex gap-12 mb-10"
      >
        <StatBox label="DAMAGE DEALT" value={winnerDamage} color={winner.color} name={winner.name} />
        <div className="w-px bg-mk-border" />
        <StatBox label="DAMAGE DEALT" value={loserDamage} color={loser.color} name={loser.name} />
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="relative z-10 flex gap-4"
      >
        <button
          onClick={() => onNavigate('select')}
          className="font-[Orbitron] font-bold text-sm px-8 py-3 border-2 border-mk-red text-mk-red
            hover:bg-mk-red hover:text-white transition-all cursor-pointer"
        >
          REMATCH
        </button>
        <button
          onClick={() => onNavigate('title')}
          className="font-[Orbitron] font-bold text-sm px-8 py-3 border border-mk-border text-gray-400
            hover:border-white hover:text-white transition-all cursor-pointer"
        >
          MAIN MENU
        </button>
      </motion.div>
    </div>
  );
}

function StatBox({ label, value, color, name }: { label: string; value: number; color: string; name: string }) {
  return (
    <div className="text-center">
      <span className="font-[Orbitron] text-xs tracking-wider" style={{ color }}>{name}</span>
      <div className="font-[Orbitron] font-black text-3xl text-white mt-1">{value}</div>
      <span className="text-[10px] text-gray-500 tracking-wider">{label}</span>
    </div>
  );
}
