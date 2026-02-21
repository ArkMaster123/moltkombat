import { useState, useCallback } from 'react';
import type { Fighter, GameScreen, MatchResult } from './types/game';
import { recordMatch } from './utils/stats';
import TitleScreen from './components/TitleScreen';
import CharacterSelect from './components/CharacterSelect';
import BattleArena from './components/BattleArena';
import ResultScreen from './components/ResultScreen';
import TournamentBracket from './components/TournamentBracket';
import StatsScreen from './components/StatsScreen';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [selectedP1, setSelectedP1] = useState<Fighter | null>(null);
  const [selectedP2, setSelectedP2] = useState<Fighter | null>(null);
  const [lastResult, setLastResult] = useState<MatchResult | null>(null);

  const handleNavigate = useCallback((s: GameScreen) => {
    setScreen(s);
  }, []);

  const handleFight = useCallback((p1: Fighter, p2: Fighter) => {
    setSelectedP1(p1);
    setSelectedP2(p2);
    setScreen('arena');
  }, []);

  const handleMatchEnd = useCallback((result: MatchResult) => {
    recordMatch(result);
    setLastResult(result);
    setScreen('result');
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-mk-black">
      {screen === 'title' && (
        <TitleScreen onNavigate={handleNavigate} />
      )}
      {screen === 'select' && (
        <CharacterSelect onFight={handleFight} onBack={() => handleNavigate('title')} />
      )}
      {screen === 'arena' && selectedP1 && selectedP2 && (
        <BattleArena
          key={`${selectedP1.id}-${selectedP2.id}-${Date.now()}`}
          player1={selectedP1}
          player2={selectedP2}
          onMatchEnd={handleMatchEnd}
          onBack={() => handleNavigate('select')}
        />
      )}
      {screen === 'result' && lastResult && (
        <ResultScreen result={lastResult} onNavigate={handleNavigate} />
      )}
      {screen === 'tournament' && (
        <TournamentBracket onNavigate={handleNavigate} />
      )}
      {screen === 'stats' && (
        <StatsScreen onNavigate={handleNavigate} />
      )}
    </div>
  );
}
