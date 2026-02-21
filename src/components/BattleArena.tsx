import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Fighter, FighterState, CombatEvent, Move, MatchResult } from '../types/game';
import { createFighterState, executeTurn, aiSelectMove, getAvailableMoves, getRandomTrashTalk } from '../utils/combat';
import HealthBar from './HealthBar';
import CombatLog from './CombatLog';

interface BattleArenaProps {
  player1: Fighter;
  player2: Fighter;
  onMatchEnd: (result: MatchResult) => void;
  onBack: () => void;
}

type BattlePhase = 'intro' | 'fighting' | 'ko' | 'finished';

export default function BattleArena({ player1, player2, onMatchEnd, onBack }: BattleArenaProps) {
  const [p1State, setP1State] = useState<FighterState>(() => createFighterState(player1));
  const [p2State, setP2State] = useState<FighterState>(() => createFighterState(player2));
  const [events, setEvents] = useState<CombatEvent[]>([]);
  const [phase, setPhase] = useState<BattlePhase>('intro');
  const [round] = useState(1);
  const [currentTurn, setCurrentTurn] = useState<'p1' | 'p2'>('p1');
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [shakeLeft, setShakeLeft] = useState(false);
  const [shakeRight, setShakeRight] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const autoPlayRef = useRef(false);

  const totalDamage = useRef<Record<string, number>>({ [player1.id]: 0, [player2.id]: 0 });
  const moveCounts = useRef<Record<string, Record<string, number>>>({
    [player1.id]: {},
    [player2.id]: {},
  });

  // Intro sequence
  useEffect(() => {
    if (phase !== 'intro') return;
    const timer1 = setTimeout(() => {
      setAnnouncement(`ROUND ${round}`);
    }, 300);
    const timer2 = setTimeout(() => {
      addEvent({
        type: 'commentary',
        message: getRandomTrashTalk(player1),
        timestamp: Date.now(),
      });
    }, 1200);
    const timer3 = setTimeout(() => {
      addEvent({
        type: 'commentary',
        message: getRandomTrashTalk(player2),
        timestamp: Date.now(),
      });
    }, 2000);
    const timer4 = setTimeout(() => {
      setAnnouncement('FIGHT!');
    }, 2800);
    const timer5 = setTimeout(() => {
      setAnnouncement(null);
      setPhase('fighting');
    }, 3500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [phase, round, player1, player2]);

  function addEvent(event: CombatEvent) {
    setEvents(prev => [...prev, event]);
  }

  const executeMove = useCallback((move: Move) => {
    if (phase !== 'fighting') return;

    const attacker = currentTurn === 'p1' ? p1State : p2State;
    const defender = currentTurn === 'p1' ? p2State : p1State;

    const result = executeTurn(attacker, defender, move);

    // Track stats
    const attackerId = attacker.fighter.id;
    const dmgEvent = result.events.find(e => e.damage);
    if (dmgEvent?.damage) {
      totalDamage.current[attackerId] += dmgEvent.damage;
    }
    moveCounts.current[attackerId][move.name] = (moveCounts.current[attackerId][move.name] || 0) + 1;

    // Apply shake to the defender
    if (dmgEvent?.damage) {
      if (currentTurn === 'p1') {
        setShakeRight(true);
        setTimeout(() => setShakeRight(false), 500);
      } else {
        setShakeLeft(true);
        setTimeout(() => setShakeLeft(false), 500);
      }
    }

    // Update states
    if (currentTurn === 'p1') {
      setP1State(result.attackerState);
      setP2State(result.defenderState);
    } else {
      setP2State(result.attackerState);
      setP1State(result.defenderState);
    }

    setEvents(prev => [...prev, ...result.events]);

    // Check for KO
    const koEvent = result.events.find(e => e.type === 'ko');
    if (koEvent) {
      setPhase('ko');
      setAnnouncement('K.O.!');
      const winner = currentTurn === 'p1' ? player1 : player2;
      setTimeout(() => {
        setPhase('finished');
        setAnnouncement(`${winner.name} WINS!`);
        onMatchEnd({
          player1,
          player2,
          winner,
          rounds: [{
            winner: winner.id,
            loser: currentTurn === 'p1' ? player2.id : player1.id,
            events,
            roundNumber: round,
          }],
          totalDamageDealt: { ...totalDamage.current },
          movesUsed: JSON.parse(JSON.stringify(moveCounts.current)),
        });
      }, 2000);
      return;
    }

    // Switch turn
    setCurrentTurn(prev => prev === 'p1' ? 'p2' : 'p1');
  }, [phase, currentTurn, p1State, p2State, player1, player2, events, round, onMatchEnd]);

  // Auto-play: AI makes a move for the current turn
  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  useEffect(() => {
    if (!autoPlayRef.current || phase !== 'fighting') return;
    const timer = setTimeout(() => {
      if (!autoPlayRef.current || phase !== 'fighting') return;
      const attacker = currentTurn === 'p1' ? p1State : p2State;
      const defender = currentTurn === 'p1' ? p2State : p1State;
      const move = aiSelectMove(attacker, defender);
      executeMove(move);
    }, 800);
    return () => clearTimeout(timer);
  }, [currentTurn, autoPlay, phase, p1State, p2State, executeMove]);

  const currentAttacker = currentTurn === 'p1' ? p1State : p2State;
  const currentDefender = currentTurn === 'p1' ? p2State : p1State;
  const availableMoves = phase === 'fighting' ? getAvailableMoves(currentAttacker) : [];

  return (
    <div className="flex flex-col h-full w-full bg-mk-black relative overflow-hidden">
      {/* Arena background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 50%, rgba(220,38,38,0.3), transparent 50%), radial-gradient(circle at 70% 50%, rgba(59,130,246,0.3), transparent 50%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-2 border-b border-mk-border bg-mk-dark/80">
        <button onClick={onBack} className="font-[Orbitron] text-xs text-gray-500 hover:text-white transition-colors cursor-pointer">
          ← EXIT
        </button>
        <div className="font-[Orbitron] text-xs text-gray-500 tracking-wider">
          ROUND {round} — {currentTurn === 'p1' ? player1.name : player2.name}'S TURN
        </div>
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          className={`font-[Orbitron] text-xs px-3 py-1 border transition-colors cursor-pointer ${
            autoPlay
              ? 'border-mk-gold text-mk-gold bg-mk-gold/10'
              : 'border-mk-border text-gray-500 hover:text-white'
          }`}
        >
          {autoPlay ? 'AUTO ▶' : 'AUTO ▷'}
        </button>
      </div>

      {/* Health bars */}
      <div className="relative z-10 flex items-start justify-between gap-8 px-6 py-4">
        <div className={`flex-1 ${shakeLeft ? 'animate-shake' : ''}`}>
          <HealthBar state={p1State} side="left" />
        </div>
        <div className="font-[Orbitron] font-black text-2xl text-mk-red self-center">VS</div>
        <div className={`flex-1 ${shakeRight ? 'animate-shake' : ''}`}>
          <HealthBar state={p2State} side="right" />
        </div>
      </div>

      {/* Fighter avatars area */}
      <div className="relative z-10 flex-1 flex items-center justify-center gap-16 min-h-0">
        {/* P1 Avatar */}
        <motion.div
          animate={{
            scale: currentTurn === 'p1' && phase === 'fighting' ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center"
        >
          <div
            className="text-8xl md:text-9xl"
            style={{ filter: `drop-shadow(0 0 20px ${player1.color})` }}
          >
            {player1.avatar}
          </div>
          {currentTurn === 'p1' && phase === 'fighting' && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-[Orbitron] text-xs text-mk-gold mt-2 tracking-wider"
            >
              ATTACKING
            </motion.span>
          )}
        </motion.div>

        {/* Center effect */}
        <AnimatePresence>
          {announcement && (
            <motion.div
              key={announcement}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'backOut' }}
              className="absolute inset-0 flex items-center justify-center z-20"
            >
              <span
                className={`font-[Orbitron] font-black text-5xl md:text-7xl tracking-wider ${
                  announcement === 'K.O.!' ? 'text-mk-red animate-ko-zoom' :
                  announcement === 'FIGHT!' ? 'text-mk-gold' :
                  announcement.includes('WINS') ? 'text-mk-gold' :
                  'text-white'
                }`}
                style={{
                  textShadow: announcement === 'K.O.!'
                    ? '0 0 40px rgba(220,38,38,0.8)'
                    : '0 0 30px rgba(245,158,11,0.5)',
                }}
              >
                {announcement}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* P2 Avatar */}
        <motion.div
          animate={{
            scale: currentTurn === 'p2' && phase === 'fighting' ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center"
        >
          <div
            className="text-8xl md:text-9xl"
            style={{ filter: `drop-shadow(0 0 20px ${player2.color})` }}
          >
            {player2.avatar}
          </div>
          {currentTurn === 'p2' && phase === 'fighting' && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-[Orbitron] text-xs text-mk-gold mt-2 tracking-wider"
            >
              ATTACKING
            </motion.span>
          )}
        </motion.div>
      </div>

      {/* Bottom section: moves + combat log */}
      <div className="relative z-10 border-t border-mk-border bg-mk-dark/90 p-4">
        <div className="flex gap-4 max-w-6xl mx-auto">
          {/* Move buttons */}
          <div className="flex-1">
            <div className="font-[Orbitron] text-[10px] text-gray-500 tracking-wider mb-2">
              {phase === 'fighting'
                ? `${currentAttacker.fighter.name}'S MOVES`
                : phase === 'intro' ? 'PREPARING...' : 'MATCH OVER'}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {phase === 'fighting' && currentAttacker.fighter.moves.map((move) => {
                const canUse = availableMoves.includes(move);
                return (
                  <motion.button
                    key={move.name}
                    whileHover={canUse ? { scale: 1.03 } : {}}
                    whileTap={canUse ? { scale: 0.97 } : {}}
                    onClick={() => canUse && !autoPlay && executeMove(move)}
                    disabled={!canUse || autoPlay}
                    className={`
                      text-left px-3 py-2 border rounded-sm transition-all text-sm cursor-pointer
                      ${canUse && !autoPlay
                        ? 'border-mk-border bg-mk-panel hover:border-mk-gold hover:bg-mk-gold/5'
                        : 'border-mk-border/30 bg-mk-dark/50 opacity-40 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-xs ${
                        move.type === 'finisher' ? 'text-mk-red' :
                        move.type === 'special' ? 'text-mk-gold' :
                        'text-white'
                      }`}>
                        {move.name}
                      </span>
                      <span className="text-mk-red font-[Orbitron] text-[10px]">{move.damage}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-gray-600">
                        {move.type === 'basic' ? 'FREE' : `${move.energyCost} EN`}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {Math.round(move.accuracy * 100)}%
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Combat log */}
          <div className="w-72 hidden md:block h-40">
            <div className="font-[Orbitron] text-[10px] text-gray-500 tracking-wider mb-2">COMBAT LOG</div>
            <div className="h-[calc(100%-20px)]">
              <CombatLog events={events} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
