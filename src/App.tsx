import { useState, useCallback } from 'react';
import type { Fighter, GameScreen, MatchResult } from './types/game';
import { recordMatch } from './utils/stats';
import { isMuted, setMuted } from './utils/sound';
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
  const [muted, setMutedState] = useState(isMuted());

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  }, [muted]);

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
      {/* Mute/Unmute floating button */}
      <button
        onClick={toggleMute}
        className="fixed top-3 right-3 z-[9998] w-10 h-10 flex items-center justify-center
          border border-mk-border bg-mk-dark/90 hover:border-mk-gold hover:text-mk-gold
          text-gray-500 transition-colors cursor-pointer rounded-sm font-[Orbitron] text-lg"
        title={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </svg>
        )}
      </button>

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
