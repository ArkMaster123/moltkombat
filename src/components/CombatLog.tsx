import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CombatEvent } from '../types/game';

interface CombatLogProps {
  events: CombatEvent[];
}

export default function CombatLog({ events }: CombatLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length]);

  function getEventColor(type: CombatEvent['type']): string {
    switch (type) {
      case 'critical': return 'text-mk-gold';
      case 'attack': return 'text-white';
      case 'miss': return 'text-gray-500';
      case 'ko': return 'text-mk-red';
      case 'status': return 'text-purple-400';
      case 'commentary': return 'text-mk-neon';
      case 'block': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  }

  function getEventPrefix(type: CombatEvent['type']): string {
    switch (type) {
      case 'critical': return '💥';
      case 'attack': return '⚔️';
      case 'miss': return '💨';
      case 'ko': return '☠️';
      case 'status': return '🔮';
      case 'commentary': return '🎙️';
      case 'block': return '🛡️';
      default: return '•';
    }
  }

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto px-3 py-2 bg-mk-dark/80 border border-mk-border rounded-sm"
    >
      <AnimatePresence initial={false}>
        {events.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className={`text-xs leading-relaxed py-0.5 ${getEventColor(event.type)}`}
          >
            <span className="mr-1">{getEventPrefix(event.type)}</span>
            {event.message}
          </motion.div>
        ))}
      </AnimatePresence>
      {events.length === 0 && (
        <div className="text-gray-600 text-xs text-center py-4 font-[Orbitron] tracking-wider">
          WAITING FOR COMBAT...
        </div>
      )}
    </div>
  );
}
