import type { Fighter, FighterState, Move, CombatEvent, StatusEffect } from '../types/game';

const MAX_HP = 100;
const MAX_ENERGY = 100;
const ENERGY_PER_TURN = 15;
const BLOCK_DAMAGE_REDUCTION = 0.6;
const CRITICAL_CHANCE = 0.15;
const CRITICAL_MULTIPLIER = 1.8;
const STATUS_EFFECT_CHANCE = 0.25;

export function createFighterState(fighter: Fighter): FighterState {
  return {
    fighter,
    hp: MAX_HP,
    maxHp: MAX_HP,
    energy: 30,
    maxEnergy: MAX_ENERGY,
    isBlocking: false,
    statusEffects: [],
    comboCount: 0,
  };
}

export function getAvailableMoves(state: FighterState): Move[] {
  return state.fighter.moves.filter(move => move.energyCost <= state.energy);
}

function rollHit(accuracy: number, attackerSpeed: number, defenderSpeed: number): boolean {
  const speedBonus = (attackerSpeed - defenderSpeed) * 0.02;
  return Math.random() < accuracy + speedBonus;
}

function rollCritical(attackerIntel: number): boolean {
  const intelBonus = attackerIntel * 0.01;
  return Math.random() < CRITICAL_CHANCE + intelBonus;
}

function calculateDamage(
  move: Move,
  attacker: FighterState,
  defender: FighterState,
  isCritical: boolean
): number {
  const attackStat = attacker.fighter.stats.attack;
  const defenseStat = defender.fighter.stats.defense;

  let baseDamage = move.damage * (1 + (attackStat - 5) * 0.08);

  // Defense reduction
  const defenseReduction = 1 - (defenseStat - 5) * 0.04;
  baseDamage *= Math.max(0.5, defenseReduction);

  // Critical hit
  if (isCritical) {
    baseDamage *= CRITICAL_MULTIPLIER;
  }

  // Blocking
  if (defender.isBlocking) {
    baseDamage *= 1 - BLOCK_DAMAGE_REDUCTION;
  }

  // Combo bonus
  if (attacker.comboCount > 0) {
    baseDamage *= 1 + attacker.comboCount * 0.1;
  }

  // Status effects
  const burnEffect = attacker.statusEffects.find(e => e.type === 'burn');
  if (burnEffect) {
    baseDamage *= 0.85;
  }

  const boostEffect = attacker.statusEffects.find(e => e.type === 'boost');
  if (boostEffect) {
    baseDamage *= 1 + boostEffect.value * 0.01;
  }

  // Add small random variance
  baseDamage *= 0.9 + Math.random() * 0.2;

  return Math.round(Math.max(1, baseDamage));
}

function maybeApplyStatusEffect(move: Move, defender: FighterState): StatusEffect | null {
  if (Math.random() > STATUS_EFFECT_CHANCE) return null;
  if (move.type === 'basic') return null;

  const types: StatusEffect['type'][] = ['burn', 'freeze', 'glitch'];
  const type = types[Math.floor(Math.random() * types.length)];
  return { type, turnsRemaining: 2, value: 5 };
}

function tickStatusEffects(state: FighterState): { state: FighterState; events: CombatEvent[] } {
  const events: CombatEvent[] = [];
  const remainingEffects: StatusEffect[] = [];

  for (const effect of state.statusEffects) {
    if (effect.type === 'burn') {
      const burnDmg = effect.value;
      state = { ...state, hp: Math.max(0, state.hp - burnDmg) };
      events.push({
        type: 'status',
        defender: state.fighter.id,
        damage: burnDmg,
        message: `${state.fighter.name} takes ${burnDmg} burn damage!`,
        timestamp: Date.now(),
      });
    }

    if (effect.turnsRemaining > 1) {
      remainingEffects.push({ ...effect, turnsRemaining: effect.turnsRemaining - 1 });
    }
  }

  return { state: { ...state, statusEffects: remainingEffects }, events };
}

export interface TurnResult {
  attackerState: FighterState;
  defenderState: FighterState;
  events: CombatEvent[];
}

export function executeTurn(
  attacker: FighterState,
  defender: FighterState,
  move: Move
): TurnResult {
  const events: CombatEvent[] = [];

  // Check for freeze - skip turn
  const freezeEffect = attacker.statusEffects.find(e => e.type === 'freeze');
  if (freezeEffect) {
    events.push({
      type: 'status',
      attacker: attacker.fighter.id,
      message: `${attacker.fighter.name} is frozen and can't move!`,
      timestamp: Date.now(),
    });
    // Tick status effects for attacker
    const { state: newAttacker, events: statusEvents } = tickStatusEffects(attacker);
    return {
      attackerState: { ...newAttacker, energy: Math.min(newAttacker.maxEnergy, newAttacker.energy + ENERGY_PER_TURN) },
      defenderState: defender,
      events: [...events, ...statusEvents],
    };
  }

  // Deduct energy
  let newAttacker = { ...attacker, energy: attacker.energy - move.energyCost };

  // Roll hit
  const hit = rollHit(move.accuracy, attacker.fighter.stats.speed, defender.fighter.stats.speed);

  if (!hit) {
    events.push({
      type: 'miss',
      attacker: attacker.fighter.id,
      defender: defender.fighter.id,
      move,
      message: `${attacker.fighter.name} used ${move.name} but MISSED!`,
      timestamp: Date.now(),
    });
    newAttacker = { ...newAttacker, comboCount: 0 };
  } else {
    const isCritical = rollCritical(attacker.fighter.stats.intelligence);
    const damage = calculateDamage(move, newAttacker, defender, isCritical);

    const eventType = isCritical ? 'critical' : 'attack';
    const critText = isCritical ? ' CRITICAL HIT!' : '';
    const blockText = defender.isBlocking ? ' (blocked!)' : '';

    events.push({
      type: eventType,
      attacker: attacker.fighter.id,
      defender: defender.fighter.id,
      move,
      damage,
      message: `${attacker.fighter.name} used ${move.name} for ${damage} damage!${critText}${blockText}`,
      timestamp: Date.now(),
    });

    let newDefender = { ...defender, hp: Math.max(0, defender.hp - damage) };

    // Status effect
    const statusEffect = maybeApplyStatusEffect(move, newDefender);
    if (statusEffect) {
      newDefender = {
        ...newDefender,
        statusEffects: [...newDefender.statusEffects, statusEffect],
      };
      events.push({
        type: 'status',
        defender: defender.fighter.id,
        message: `${defender.fighter.name} is afflicted with ${statusEffect.type}!`,
        timestamp: Date.now(),
      });
    }

    // Update combo
    newAttacker = { ...newAttacker, comboCount: newAttacker.comboCount + 1 };

    // KO check
    if (newDefender.hp <= 0) {
      events.push({
        type: 'ko',
        attacker: attacker.fighter.id,
        defender: defender.fighter.id,
        message: `${defender.fighter.name} has been KNOCKED OUT!`,
        timestamp: Date.now(),
      });
    }

    // Tick defender status
    const { state: tickedDefender, events: defStatusEvents } = tickStatusEffects(newDefender);
    events.push(...defStatusEvents);

    // Regen energy
    const finalAttacker = {
      ...newAttacker,
      energy: Math.min(newAttacker.maxEnergy, newAttacker.energy + ENERGY_PER_TURN),
    };

    // Tick attacker status
    const { state: tickedAttacker, events: atkStatusEvents } = tickStatusEffects(finalAttacker);
    events.push(...atkStatusEvents);

    return {
      attackerState: tickedAttacker,
      defenderState: tickedDefender,
      events,
    };
  }

  // Regen energy on miss
  const finalAttacker = {
    ...newAttacker,
    energy: Math.min(newAttacker.maxEnergy, newAttacker.energy + ENERGY_PER_TURN),
  };
  const { state: tickedAttacker, events: atkStatusEvents } = tickStatusEffects(finalAttacker);
  events.push(...atkStatusEvents);

  return {
    attackerState: tickedAttacker,
    defenderState: defender,
    events,
  };
}

/** AI opponent picks a move based on game state */
export function aiSelectMove(state: FighterState, opponentState: FighterState): Move {
  const available = getAvailableMoves(state);
  if (available.length === 0) return state.fighter.moves[0]; // fallback basic

  // If opponent is low HP and finisher available, use it
  if (opponentState.hp <= 25) {
    const finisher = available.find(m => m.type === 'finisher');
    if (finisher) return finisher;
    const special = available.find(m => m.type === 'special');
    if (special) return special;
  }

  // If we have lots of energy, consider special moves
  if (state.energy >= 60) {
    const specials = available.filter(m => m.type === 'special');
    if (specials.length > 0 && Math.random() > 0.3) {
      return specials[Math.floor(Math.random() * specials.length)];
    }
  }

  // Random weighted selection favoring basics
  const weights = available.map(m => {
    if (m.type === 'basic') return 3;
    if (m.type === 'special') return 2;
    return 1;
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < available.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return available[i];
  }
  return available[0];
}

export function getRandomTrashTalk(fighter: Fighter): string {
  return fighter.trashTalk[Math.floor(Math.random() * fighter.trashTalk.length)];
}

export function getWinQuote(fighter: Fighter): string {
  return fighter.winQuotes[Math.floor(Math.random() * fighter.winQuotes.length)];
}

export function getLoseQuote(fighter: Fighter): string {
  return fighter.loseQuotes[Math.floor(Math.random() * fighter.loseQuotes.length)];
}
