export interface Move {
  name: string;
  damage: number;
  type: 'basic' | 'special' | 'finisher';
  /** Cost in energy (0-100). Basic=0, special=20-40, finisher=100 */
  energyCost: number;
  /** Hit chance 0-1 */
  accuracy: number;
  /** Animation key for visual effect */
  animation: 'punch' | 'kick' | 'projectile' | 'beam' | 'slam' | 'drain' | 'explosion' | 'glitch';
  description: string;
}

export interface Fighter {
  id: string;
  name: string;
  subtitle: string;
  company: string;
  color: string; // primary neon accent
  colorSecondary: string;
  avatar: string; // placeholder emoji or image path
  stats: {
    attack: number;  // 1-10
    defense: number;  // 1-10
    speed: number;    // 1-10
    intelligence: number; // 1-10
  };
  moves: Move[];
  trashTalk: string[];
  winQuotes: string[];
  loseQuotes: string[];
  bio: string;
}

export interface FighterState {
  fighter: Fighter;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  isBlocking: boolean;
  statusEffects: StatusEffect[];
  comboCount: number;
}

export interface StatusEffect {
  type: 'burn' | 'freeze' | 'glitch' | 'boost';
  turnsRemaining: number;
  value: number;
}

export interface CombatEvent {
  type: 'attack' | 'block' | 'miss' | 'critical' | 'status' | 'ko' | 'commentary';
  attacker?: string;
  defender?: string;
  move?: Move;
  damage?: number;
  message: string;
  timestamp: number;
}

export interface RoundResult {
  winner: string;
  loser: string;
  events: CombatEvent[];
  roundNumber: number;
}

export interface MatchResult {
  player1: Fighter;
  player2: Fighter;
  winner: Fighter;
  rounds: RoundResult[];
  totalDamageDealt: Record<string, number>;
  movesUsed: Record<string, Record<string, number>>;
}

export interface TournamentMatch {
  id: string;
  round: number;
  position: number;
  fighter1: Fighter | null;
  fighter2: Fighter | null;
  winner: Fighter | null;
  result: MatchResult | null;
}

export interface Tournament {
  id: string;
  name: string;
  fighters: Fighter[];
  matches: TournamentMatch[];
  currentMatch: number;
  isComplete: boolean;
}

export interface PlayerStats {
  fighterId: string;
  wins: number;
  losses: number;
  totalDamageDealt: number;
  totalDamageReceived: number;
  favoriteMove: string;
  moveCounts: Record<string, number>;
  finishersLanded: number;
  perfectRounds: number;
}

export interface GameStats {
  totalMatches: number;
  fighterStats: Record<string, PlayerStats>;
  recentMatches: MatchResult[];
}

export type GameScreen = 'title' | 'select' | 'arena' | 'tournament' | 'stats' | 'result';
