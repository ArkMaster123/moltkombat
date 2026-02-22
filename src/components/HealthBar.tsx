import { motion } from 'framer-motion';
import type { FighterState } from '../types/game';
import FighterPortrait from './FighterPortrait';

interface HealthBarProps {
  state: FighterState;
  side: 'left' | 'right';
}

export default function HealthBar({ state, side }: HealthBarProps) {
  const hpPercent = (state.hp / state.maxHp) * 100;
  const energyPercent = (state.energy / state.maxEnergy) * 100;
  const isLow = hpPercent < 25;
  const isMedium = hpPercent < 50 && !isLow;

  const hpColor = isLow ? '#dc2626' : isMedium ? '#f59e0b' : '#22c55e';
  const isRight = side === 'right';

  return (
    <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'} w-full`}>
      {/* Fighter name */}
      <div className={`flex items-center gap-2 mb-1 ${isRight ? 'flex-row-reverse' : ''}`}>
        <FighterPortrait fighter={state.fighter} size="sm" />
        <div className={isRight ? 'text-right' : ''}>
          <span
            className="font-[Orbitron] font-bold text-sm tracking-wider"
            style={{ color: state.fighter.color }}
          >
            {state.fighter.name}
          </span>
          <span className="block text-[10px] text-gray-500">{state.fighter.company}</span>
        </div>
      </div>

      {/* HP bar */}
      <div className={`w-full h-5 bg-mk-dark border border-mk-border rounded-sm overflow-hidden ${isRight ? 'rotate-180' : ''}`}>
        <motion.div
          className={`h-full ${isLow ? 'animate-hp-pulse' : ''}`}
          style={{ backgroundColor: hpColor }}
          animate={{ width: `${hpPercent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className={`flex justify-between w-full text-[10px] mt-0.5 ${isRight ? 'flex-row-reverse' : ''}`}>
        <span className="text-gray-500">HP</span>
        <span style={{ color: hpColor }}>{state.hp}/{state.maxHp}</span>
      </div>

      {/* Energy bar */}
      <div className={`w-full h-2 bg-mk-dark border border-mk-border/50 rounded-sm overflow-hidden mt-1 ${isRight ? 'rotate-180' : ''}`}>
        <motion.div
          className="h-full bg-mk-neon"
          animate={{ width: `${energyPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className={`flex justify-between w-full text-[10px] mt-0.5 ${isRight ? 'flex-row-reverse' : ''}`}>
        <span className="text-gray-500">EN</span>
        <span className="text-mk-neon">{state.energy}/{state.maxEnergy}</span>
      </div>

      {/* Status effects */}
      {state.statusEffects.length > 0 && (
        <div className={`flex gap-1 mt-1 ${isRight ? 'flex-row-reverse' : ''}`}>
          {state.statusEffects.map((effect, i) => (
            <span
              key={i}
              className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold ${
                effect.type === 'burn' ? 'bg-red-900/50 text-red-400' :
                effect.type === 'freeze' ? 'bg-blue-900/50 text-blue-400' :
                effect.type === 'glitch' ? 'bg-purple-900/50 text-purple-400' :
                'bg-green-900/50 text-green-400'
              }`}
            >
              {effect.type.toUpperCase()} ({effect.turnsRemaining})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
