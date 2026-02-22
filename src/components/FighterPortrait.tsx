import type { Fighter } from '../types/game';

interface FighterPortraitProps {
  fighter: Fighter;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'arena';
  className?: string;
  glowColor?: string;
}

const sizeClasses: Record<string, string> = {
  xs: 'w-6 h-6',
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
  arena: 'w-40 h-40 md:w-56 md:h-56',
};

export default function FighterPortrait({ fighter, size = 'md', className = '', glowColor }: FighterPortraitProps) {
  const glow = glowColor || fighter.color;

  return (
    <div
      className={`relative rounded-lg overflow-hidden ${sizeClasses[size]} ${className}`}
      style={{
        boxShadow: `0 0 20px ${glow}60, 0 0 40px ${glow}30, inset 0 0 20px ${glow}15`,
        border: `2px solid ${glow}80`,
      }}
    >
      <img
        src={fighter.imageUrl}
        alt={fighter.name}
        className="w-full h-full object-cover"
        draggable={false}
      />
      {/* Neon edge glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 30px ${glow}25`,
        }}
      />
    </div>
  );
}
