import { motion } from 'framer-motion';
import type { GameScreen } from '../types/game';

interface TitleScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

export default function TitleScreen({ onNavigate }: TitleScreenProps) {
  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden bg-mk-black">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(220,38,38,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(220,38,38,0.15)_0%,_transparent_70%)]" />

      {/* Title */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center mb-12"
      >
        <h1
          className="font-[Orbitron] font-black text-7xl md:text-8xl lg:text-9xl tracking-wider text-mk-red animate-text-glitch"
          style={{ textShadow: '0 0 40px rgba(220,38,38,0.5), 0 0 80px rgba(220,38,38,0.3)' }}
        >
          AI ARENA
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="font-[Orbitron] text-mk-gold text-lg md:text-xl tracking-[0.3em] mt-4"
        >
          MODEL KOMBAT
        </motion.p>
      </motion.div>

      {/* Dragon-style divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="relative z-10 w-64 h-[2px] bg-gradient-to-r from-transparent via-mk-red to-transparent mb-12"
      />

      {/* Menu buttons */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative z-10 flex flex-col gap-4 items-center"
      >
        <MenuButton label="FIGHT" sublabel="1 vs 1 Battle" onClick={() => onNavigate('select')} primary />
        <MenuButton label="TOURNAMENT" sublabel="8 Fighter Bracket" onClick={() => onNavigate('tournament')} />
        <MenuButton label="STATS" sublabel="Fight Records" onClick={() => onNavigate('stats')} />
      </motion.div>

      {/* Bottom text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-6 font-[Orbitron] text-xs tracking-[0.2em] text-gray-500"
      >
        SELECT YOUR DESTINY
      </motion.p>
    </div>
  );
}

function MenuButton({
  label,
  sublabel,
  onClick,
  primary = false,
}: {
  label: string;
  sublabel: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, x: 4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        group relative w-72 px-8 py-4 text-left cursor-pointer
        border ${primary ? 'border-mk-red/60' : 'border-mk-border'}
        bg-mk-panel/80 backdrop-blur-sm
        hover:border-mk-red hover:bg-mk-red/10
        transition-colors duration-200
      `}
    >
      <span
        className={`font-[Orbitron] font-bold text-xl tracking-wider ${
          primary ? 'text-mk-red' : 'text-white'
        } group-hover:text-mk-red transition-colors`}
      >
        {label}
      </span>
      <span className="block text-sm text-gray-500 tracking-wide mt-0.5">{sublabel}</span>
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-mk-red/0 group-hover:text-mk-red/80 transition-all font-[Orbitron] text-lg">
        ›
      </span>
    </motion.button>
  );
}
