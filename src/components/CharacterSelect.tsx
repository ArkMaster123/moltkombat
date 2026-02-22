import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Fighter } from '../types/game';
import { fighters } from '../data/fighters';
import FighterPortrait from './FighterPortrait';
import { playSound } from '../utils/sound';

interface CharacterSelectProps {
  onFight: (p1: Fighter, p2: Fighter) => void;
  onBack: () => void;
}

export default function CharacterSelect({ onFight, onBack }: CharacterSelectProps) {
  const [player1, setPlayer1] = useState<Fighter | null>(null);
  const [player2, setPlayer2] = useState<Fighter | null>(null);
  const [selectingFor, setSelectingFor] = useState<1 | 2>(1);

  function handleSelect(fighter: Fighter) {
    playSound('select');
    if (selectingFor === 1) {
      setPlayer1(fighter);
      setSelectingFor(2);
    } else {
      setPlayer2(fighter);
    }
  }

  function handleRandomP2() {
    const available = fighters.filter(f => f.id !== player1?.id);
    const random = available[Math.floor(Math.random() * available.length)];
    setPlayer2(random);
  }

  function handleReset() {
    setPlayer1(null);
    setPlayer2(null);
    setSelectingFor(1);
  }

  const selectedFighter = selectingFor === 1 ? player1 : player2;
  const hoveredOrSelected = selectedFighter;

  return (
    <div className="flex flex-col h-full w-full bg-mk-black">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-mk-border">
        <button
          onClick={onBack}
          className="font-[Orbitron] text-sm text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          ← BACK
        </button>
        <h2 className="font-[Orbitron] font-bold text-xl tracking-wider text-mk-gold">
          {selectingFor === 1 ? 'SELECT PLAYER 1' : 'SELECT PLAYER 2'}
        </h2>
        <button
          onClick={handleReset}
          className="font-[Orbitron] text-sm text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          RESET
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Fighter Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {fighters.map((fighter) => {
              const isP1 = player1?.id === fighter.id;
              const isP2 = player2?.id === fighter.id;
              const isDisabled = (selectingFor === 2 && isP1);

              return (
                <motion.button
                  key={fighter.id}
                  whileHover={!isDisabled ? { scale: 1.05, y: -4 } : {}}
                  whileTap={!isDisabled ? { scale: 0.97 } : {}}
                  onClick={() => !isDisabled && handleSelect(fighter)}
                  className={`
                    relative flex flex-col items-center p-4 rounded-sm cursor-pointer
                    border-2 transition-all duration-200
                    ${isP1 ? 'border-mk-red bg-mk-red/10' : ''}
                    ${isP2 ? 'border-mk-blue bg-mk-blue/10' : ''}
                    ${!isP1 && !isP2 ? 'border-mk-border bg-mk-panel hover:border-gray-500' : ''}
                    ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                  `}
                >
                  {/* P1/P2 badge */}
                  {(isP1 || isP2) && (
                    <span
                      className={`absolute -top-2 -right-2 text-xs font-[Orbitron] font-bold px-2 py-0.5 ${
                        isP1 ? 'bg-mk-red' : 'bg-mk-blue'
                      }`}
                    >
                      {isP1 ? 'P1' : 'P2'}
                    </span>
                  )}

                  <FighterPortrait fighter={fighter} size="lg" className="mb-2" />
                  <span
                    className="font-[Orbitron] font-bold text-sm tracking-wider"
                    style={{ color: fighter.color }}
                  >
                    {fighter.name}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">{fighter.company}</span>

                  {/* Mini stat bars */}
                  <div className="w-full mt-3 space-y-1">
                    {(['attack', 'defense', 'speed', 'intelligence'] as const).map((stat) => (
                      <div key={stat} className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-600 w-8 uppercase">{stat.slice(0, 3)}</span>
                        <div className="flex-1 h-1 bg-mk-dark rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${fighter.stats[stat] * 10}%`,
                              backgroundColor: fighter.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Random / Fight buttons */}
          <div className="flex justify-center gap-4 mt-6">
            {player1 && !player2 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleRandomP2}
                className="font-[Orbitron] font-bold text-sm px-6 py-3 border border-mk-gold/60 text-mk-gold
                  hover:bg-mk-gold/10 hover:border-mk-gold transition-colors cursor-pointer"
              >
                🎲 RANDOM OPPONENT
              </motion.button>
            )}
            {player1 && player2 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onFight(player1, player2)}
                className="font-[Orbitron] font-bold text-lg px-10 py-4 border-2 border-mk-red text-mk-red
                  hover:bg-mk-red hover:text-white transition-all cursor-pointer"
              >
                FIGHT!
              </motion.button>
            )}
          </div>
        </div>

        {/* Fighter detail panel */}
        <div className="hidden lg:flex w-80 border-l border-mk-border flex-col bg-mk-dark/50">
          <AnimatePresence mode="wait">
            {hoveredOrSelected ? (
              <motion.div
                key={hoveredOrSelected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col p-6 h-full"
              >
                <div className="text-center mb-6">
                  <FighterPortrait fighter={hoveredOrSelected} size="xl" className="mx-auto" />
                  <h3
                    className="font-[Orbitron] font-black text-2xl mt-3 tracking-wider"
                    style={{ color: hoveredOrSelected.color }}
                  >
                    {hoveredOrSelected.name}
                  </h3>
                  <p className="text-sm text-gray-400 italic">{hoveredOrSelected.subtitle}</p>
                  <p className="text-xs text-gray-600 mt-1">{hoveredOrSelected.company}</p>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-6">
                  {(['attack', 'defense', 'speed', 'intelligence'] as const).map((stat) => (
                    <div key={stat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="uppercase tracking-wider text-gray-400">{stat}</span>
                        <span style={{ color: hoveredOrSelected.color }}>
                          {hoveredOrSelected.stats[stat]}/10
                        </span>
                      </div>
                      <div className="h-2 bg-mk-panel rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${hoveredOrSelected.stats[stat] * 10}%` }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: hoveredOrSelected.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Moves */}
                <div className="flex-1 overflow-y-auto">
                  <h4 className="font-[Orbitron] text-xs tracking-wider text-gray-500 mb-2">MOVES</h4>
                  <div className="space-y-2">
                    {hoveredOrSelected.moves.map((move) => (
                      <div
                        key={move.name}
                        className="flex items-center justify-between px-3 py-2 bg-mk-panel/80 border border-mk-border/50 rounded-sm text-sm"
                      >
                        <div>
                          <span className="text-white">{move.name}</span>
                          <span className={`ml-2 text-xs ${
                            move.type === 'finisher' ? 'text-mk-red' :
                            move.type === 'special' ? 'text-mk-gold' :
                            'text-gray-500'
                          }`}>
                            [{move.type.toUpperCase()}]
                          </span>
                        </div>
                        <span className="text-mk-red font-bold">{move.damage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-gray-500 mt-4 leading-relaxed">{hoveredOrSelected.bio}</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-full text-gray-600 font-[Orbitron] text-sm tracking-wider"
              >
                SELECT A FIGHTER
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
