import { useState, useCallback, useRef, useEffect } from 'react';

// ============================================================
// TYPES
// ============================================================
type Phase = 'setup' | 'playing' | 'victory';

interface GameConfig {
  team1Name: string;
  team2Name: string;
  team1Color: string;
  team2Color: string;
  setsToWin: number;
  targetPoints: number;
  tiebreakPoints: number;
  requireTwoPointAdvantage: boolean;
  maxPointLimit: number; // 0 = infinite
}

interface GameState {
  team1Score: number;
  team2Score: number;
  team1Sets: number;
  team2Sets: number;
  currentSet: number;
  teamsSwapped: boolean;
  setHistory: { team1: number; team2: number; winner: 1 | 2 }[];
  firstToTarget: 1 | 2 | null; // Chi ha raggiunto per primo il target punti
}

// ============================================================
// SETUP SCREEN COMPONENT
// ============================================================
function SetupScreen({ onStart }: { onStart: (config: GameConfig) => void }) {
  const [team1Name, setTeam1Name] = useState('Squadra 1');
  const [team2Name, setTeam2Name] = useState('Squadra 2');
  const [team1Color, setTeam1Color] = useState('#3b82f6');
  const [team2Color, setTeam2Color] = useState('#ef4444');
  const [setsToWin, setSetsToWin] = useState(3);
  const [targetPoints, setTargetPoints] = useState(25);
  const [tiebreakPoints, setTiebreakPoints] = useState(15);
  const [requireTwoPointAdvantage, setRequireTwoPointAdvantage] = useState(true);
  const [maxPointLimit, setMaxPointLimit] = useState(27);

  const handleSubmit = () => {
    onStart({
      team1Name: team1Name || 'Squadra 1',
      team2Name: team2Name || 'Squadra 2',
      team1Color,
      team2Color,
      setsToWin,
      targetPoints,
      tiebreakPoints,
      requireTwoPointAdvantage,
      maxPointLimit,
    });
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-700">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-white">
          🏐 Tabellone Pallavolo
        </h1>
        <p className="text-slate-400 text-center text-sm mb-6">Configura la partita</p>

        {/* Team Names */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Squadra 1</label>
            <input
              type="text"
              value={team1Name}
              onChange={(e) => setTeam1Name(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome squadra 1"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Squadra 2</label>
            <input
              type="text"
              value={team2Name}
              onChange={(e) => setTeam2Name(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Nome squadra 2"
            />
          </div>
        </div>

        {/* Team Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Colore Squadra 1</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={team1Color}
                onChange={(e) => setTeam1Color(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-slate-400 text-xs">{team1Color}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Colore Squadra 2</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={team2Color}
                onChange={(e) => setTeam2Color(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-slate-400 text-xs">{team2Color}</span>
            </div>
          </div>
        </div>

        {/* Sets to Win */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-2">Set per vincere la partita</label>
          <div className="flex gap-2">
            {[2, 3, 5].map((n) => (
              <button
                key={n}
                onClick={() => setSetsToWin(n)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  setsToWin === n
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Al meglio dei {n * 2 - 1}
              </button>
            ))}
          </div>
        </div>

        {/* Target Points */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Punti per set normale</label>
            <input
              type="number"
              value={targetPoints}
              onChange={(e) => setTargetPoints(Math.max(1, parseInt(e.target.value) || 25))}
              min={1}
              className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Punti tie-break</label>
            <input
              type="number"
              value={tiebreakPoints}
              onChange={(e) => setTiebreakPoints(Math.max(1, parseInt(e.target.value) || 15))}
              min={1}
              className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Two Point Advantage */}
        <div className="mb-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={requireTwoPointAdvantage}
                onChange={(e) => setRequireTwoPointAdvantage(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
            <span className="text-sm text-slate-300">Vittoria con 2 punti di scarto</span>
          </label>
        </div>

        {/* Max Point Limit */}
        {requireTwoPointAdvantage && (
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Limite massimo punti (0 = infinito)
            </label>
            <input
              type="number"
              value={maxPointLimit}
              onChange={(e) => setMaxPointLimit(Math.max(0, parseInt(e.target.value) || 0))}
              min={0}
              className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              {maxPointLimit === 0
                ? 'Nessun limite: scarto infinito'
                : `Il set finisce al raggiungimento di ${maxPointLimit} punti`}
            </p>
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          🏐 Inizia Partita
        </button>
      </div>
    </div>
  );
}

// ============================================================
// TEAM AREA COMPONENT (with tap / long-press interaction)
// ============================================================
function TeamArea({
  name,
  score,
  setsWon,
  color,
  onTap,
  onSubtract,
  isLandscape,
  isFirstToTarget,
  targetPoints,
}: {
  name: string;
  score: number;
  setsWon: number;
  color: string;
  onTap: () => void;
  onSubtract: () => void;
  isLandscape: boolean;
  isFirstToTarget: boolean;
  targetPoints: number;
}) {
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const [flash, setFlash] = useState(false);
  const [subtractFlash, setSubtractFlash] = useState(false);

  const handlePointerDown = () => {
    isLongPressRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onSubtract();
      setSubtractFlash(true);
      setTimeout(() => setSubtractFlash(false), 200);
    }, 500);
  };

  const handlePointerUp = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    if (!isLongPressRef.current) {
      onTap();
      setFlash(true);
      setTimeout(() => setFlash(false), 150);
    }
  };

  const handlePointerLeave = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  // Prevent context menu on long press
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none cursor-pointer transition-all duration-150 ${
        flash ? 'brightness-125' : ''
      } ${subtractFlash ? 'brightness-75' : ''}`}
      style={{
        backgroundColor: color,
        flex: 1,
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onContextMenu={handleContextMenu}
    >
      {/* Overlay for flash effect */}
      {flash && (
        <div className="absolute inset-0 bg-white opacity-20 animate-pulse pointer-events-none" />
      )}
      {subtractFlash && (
        <div className="absolute inset-0 bg-black opacity-30 pointer-events-none" />
      )}

      {/* Team Name with Sets Won */}
      <div className="flex items-center justify-center gap-2 md:gap-3 px-2 w-full">
        <div
          className={`font-black uppercase tracking-wide text-white text-center ${
            isLandscape ? 'text-xl md:text-3xl lg:text-4xl' : 'text-2xl md:text-4xl'
          }`}
          style={{ textShadow: '0 3px 6px rgba(0,0,0,0.6)' }}
        >
          {name}
        </div>
        {/* Sets Won Badge */}
        <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1 md:px-3 md:py-1.5">
          <div className="flex gap-0.5 md:gap-1">
            {Array.from({ length: setsWon }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white shadow-md"
              />
            ))}
          </div>
          <span
            className="text-white font-black text-lg md:text-2xl ml-1"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
          >
            {setsWon}
          </span>
        </div>
      </div>

      {/* Score */}
      <div
        className="font-black text-white leading-none"
        style={{
          fontSize: isLandscape ? 'clamp(5rem, 18vh, 14rem)' : 'clamp(5rem, 22vw, 12rem)',
          textShadow: '0 4px 8px rgba(0,0,0,0.4)',
        }}
      >
        {score}
      </div>

      {/* First to target indicator */}
      {isFirstToTarget && (
        <div
          className="mt-1 px-3 py-1 rounded-full bg-yellow-400/30 border-2 border-yellow-400 animate-pulse"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
        >
          <span className="text-yellow-200 font-bold text-xs md:text-sm">
            ⭐ Primo a {targetPoints}!
          </span>
        </div>
      )}

      {/* Hint */}
      <div
        className="absolute bottom-2 text-white/40 text-[10px] md:text-xs"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
      >
        Tap = +1 | Pressione lunga = -1
      </div>
    </div>
  );
}

// ============================================================
// SET HISTORY PANEL COMPONENT
// ============================================================
function SetHistoryPanel({
  config,
  setHistory,
  currentSet,
  onClose,
}: {
  config: GameConfig;
  setHistory: { team1: number; team2: number; winner: 1 | 2 }[];
  currentSet: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-4 md:p-6 max-w-sm w-full border border-slate-600 animate-bounce-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">📋 Storico Set</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 text-white/80 hover:bg-slate-600 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {setHistory.length === 0 ? (
          <p className="text-slate-400 text-center py-4">Nessun set completato</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {setHistory.map((set, i) => (
              <div
                key={i}
                className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                  set.winner === 1 ? 'bg-blue-900/30 border border-blue-700/50' : 'bg-red-900/30 border border-red-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-xs font-semibold">Set {i + 1}</span>
                  <span className="text-yellow-400 text-xs">
                    {set.winner === 1 ? '🏆' : '🏆'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`font-bold ${set.winner === 1 ? 'text-blue-400' : 'text-white/50'}`}
                  >
                    {config.team1Name}: {set.team1}
                  </span>
                  <span className="text-slate-600">-</span>
                  <span
                    className={`font-bold ${set.winner === 2 ? 'text-red-400' : 'text-white/50'}`}
                  >
                    {config.team2Name}: {set.team2}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-700">
          <p className="text-slate-400 text-xs text-center">
            Set in corso: <span className="text-white font-semibold">{currentSet}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// GAME SCREEN COMPONENT
// ============================================================
function GameScreen({
  config,
  gameState,
  onAddPoint,
  onSubtractPoint,
  onSwapTeams,
  onUndoSet,
  onBackToSetup,
  onSetCurrentSet,
}: {
  config: GameConfig;
  gameState: GameState;
  onAddPoint: (team: 1 | 2) => void;
  onSubtractPoint: (team: 1 | 2) => void;
  onSwapTeams: () => void;
  onUndoSet: () => void;
  onBackToSetup: () => void;
  onSetCurrentSet: (set: number) => void;
}) {
  const [isLandscape, setIsLandscape] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const { team1Score, team2Score, team1Sets, team2Sets, currentSet, teamsSwapped, setHistory, firstToTarget } = gameState;
  const maxSet = config.setsToWin * 2 - 1;
  const target = currentSet === maxSet ? config.tiebreakPoints : config.targetPoints;

  // Determine which team is displayed on left/top
  const leftTeam = teamsSwapped ? 2 : 1;
  const rightTeam = teamsSwapped ? 1 : 2;

  const leftName = leftTeam === 1 ? config.team1Name : config.team2Name;
  const rightName = rightTeam === 1 ? config.team1Name : config.team2Name;
  const leftColor = leftTeam === 1 ? config.team1Color : config.team2Color;
  const rightColor = rightTeam === 1 ? config.team1Color : config.team2Color;
  const leftScore = leftTeam === 1 ? team1Score : team2Score;
  const rightScore = rightTeam === 1 ? team1Score : team2Score;
  const leftSets = leftTeam === 1 ? team1Sets : team2Sets;
  const rightSets = rightTeam === 1 ? team1Sets : team2Sets;

  // Is this a tiebreak set?
  const isTiebreak = currentSet === config.setsToWin * 2 - 1;

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-slate-900">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-700 z-10 flex-wrap gap-2">
        {/* Set selector + info */}
        <div className="flex items-center gap-2">
          {/* Set selector buttons */}
          <button
            onClick={() => onSetCurrentSet(currentSet - 1)}
            disabled={currentSet <= 1}
            className="w-8 h-8 rounded-lg bg-slate-700 text-white text-sm font-bold hover:bg-slate-600 active:bg-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            title="Set precedente"
          >
            −
          </button>
          
          {/* Set number display - BIG and prominent */}
          <div className="flex flex-col items-center min-w-[80px]">
            <span className="text-white font-black text-2xl md:text-3xl leading-none">
              {currentSet}
            </span>
            <span className="text-white/60 text-[10px] md:text-xs font-semibold uppercase tracking-wider">
              Set {isTiebreak && <span className="text-yellow-400">TB</span>}
            </span>
          </div>

          <button
            onClick={() => onSetCurrentSet(currentSet + 1)}
            disabled={currentSet >= maxSet}
            className="w-8 h-8 rounded-lg bg-slate-700 text-white text-sm font-bold hover:bg-slate-600 active:bg-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            title="Set successivo"
          >
            +
          </button>
        </div>

        {/* First to target indicator */}
        {firstToTarget && (
          <div className="px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 animate-pulse">
            <span className="text-yellow-300 text-[10px] font-bold">
              ⭐ Primo a {target}: {firstToTarget === 1 ? config.team1Name : config.team2Name}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(true)}
            className="px-2 py-1 rounded bg-slate-700 text-white/80 text-xs hover:bg-slate-600 active:bg-slate-500 transition-colors"
            title="Storico set"
          >
            📋
          </button>
          <button
            onClick={onSwapTeams}
            className="px-2 py-1 rounded bg-slate-700 text-white/80 text-xs hover:bg-slate-600 active:bg-slate-500 transition-colors"
            title="Cambia campo"
          >
            🔄
          </button>
          <button
            onClick={onUndoSet}
            className="px-2 py-1 rounded bg-slate-700 text-white/80 text-xs hover:bg-slate-600 active:bg-slate-500 transition-colors"
            title="Annulla ultimo set"
          >
            ↩️
          </button>
          <button
            onClick={onBackToSetup}
            className="px-2 py-1 rounded bg-red-900/50 text-red-300 text-xs hover:bg-red-800/50 active:bg-red-700/50 transition-colors"
            title="Nuova partita"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div
        className={`flex-1 flex ${isLandscape ? 'flex-row' : 'flex-col'} overflow-hidden`}
      >
        {/* Left/Top Team */}
        <TeamArea
          name={leftName}
          score={leftScore}
          setsWon={leftSets}
          color={leftColor}
          onTap={() => onAddPoint(leftTeam as 1 | 2)}
          onSubtract={() => onSubtractPoint(leftTeam as 1 | 2)}
          isLandscape={isLandscape}
          isFirstToTarget={firstToTarget === leftTeam}
          targetPoints={target}
        />

        {/* Divider */}
        <div
          className={`bg-slate-800 flex items-center justify-center ${
            isLandscape ? 'w-1' : 'h-1'
          }`}
        >
          <div className="bg-slate-600 rounded-full" style={{
            width: isLandscape ? '4px' : '40px',
            height: isLandscape ? '40px' : '4px',
          }} />
        </div>

        {/* Right/Bottom Team */}
        <TeamArea
          name={rightName}
          score={rightScore}
          setsWon={rightSets}
          color={rightColor}
          onTap={() => onAddPoint(rightTeam as 1 | 2)}
          onSubtract={() => onSubtractPoint(rightTeam as 1 | 2)}
          isLandscape={isLandscape}
          isFirstToTarget={firstToTarget === rightTeam}
          targetPoints={target}
        />
      </div>

      {/* Set History Panel */}
      {showHistory && (
        <SetHistoryPanel
          config={config}
          setHistory={setHistory}
          currentSet={currentSet}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

// ============================================================
// SET WON MODAL
// ============================================================
function SetWonModal({
  winnerName,
  winnerColor,
  setNumber,
  score1,
  score2,
  onContinue,
}: {
  winnerName: string;
  winnerColor: string;
  setNumber: number;
  score1: number;
  score2: number;
  onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center border border-slate-600 animate-bounce-in">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
          Set {setNumber} vinto!
        </h2>
        <div
          className="text-2xl md:text-3xl font-black mb-2"
          style={{ color: winnerColor }}
        >
          {winnerName}
        </div>
        <p className="text-slate-400 text-lg mb-4">
          {score1} - {score2}
        </p>
        <button
          onClick={onContinue}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
        >
          Prossimo Set →
        </button>
      </div>
    </div>
  );
}

// ============================================================
// VICTORY SCREEN
// ============================================================
function VictoryScreen({
  winnerName,
  winnerColor,
  setsWon,
  setsLost,
  setHistory,
  config,
  onNewMatch,
}: {
  winnerName: string;
  winnerColor: string;
  setsWon: number;
  setsLost: number;
  setHistory: { team1: number; team2: number; winner: 1 | 2 }[];
  config: GameConfig;
  onNewMatch: () => void;
}) {
  return (
    <div className="h-[100dvh] w-full bg-slate-900 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md text-center">
        {/* Trophy */}
        <div className="text-6xl md:text-8xl mb-4 animate-bounce">🏆</div>

        {/* Winner */}
        <h1
          className="text-3xl md:text-5xl font-black mb-2"
          style={{ color: winnerColor }}
        >
          {winnerName}
        </h1>
        <p className="text-xl md:text-2xl text-white font-semibold mb-1">
          VINCITORE!
        </p>
        <p className="text-slate-400 text-lg mb-6">
          {setsWon} - {setsLost} nei set
        </p>

        {/* Set History */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
            Riepilogo Set
          </h3>
          <div className="space-y-2">
            {setHistory.map((set, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2"
              >
                <span className="text-slate-400 text-sm font-medium">Set {i + 1}</span>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold ${set.winner === 1 ? 'text-white' : 'text-slate-500'}`}
                  >
                    {config.team1Name}: {set.team1}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span
                    className={`font-bold ${set.winner === 2 ? 'text-white' : 'text-slate-500'}`}
                  >
                    {config.team2Name}: {set.team2}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Match Button */}
        <button
          onClick={onNewMatch}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          🏐 Nuova Partita
        </button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================
export default function App() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    team1Score: 0,
    team2Score: 0,
    team1Sets: 0,
    team2Sets: 0,
    currentSet: 1,
    teamsSwapped: false,
    setHistory: [],
    firstToTarget: null,
  });
  const [showSetModal, setShowSetModal] = useState(false);
  const [setModalData, setSetModalData] = useState<{
    winnerName: string;
    winnerColor: string;
    setNumber: number;
    score1: number;
    score2: number;
  } | null>(null);
  const [matchWinner, setMatchWinner] = useState<{
    name: string;
    color: string;
    setsWon: number;
    setsLost: number;
  } | null>(null);

  // Check if current set is a tiebreak
  const isTiebreak = useCallback(() => {
    if (!config) return false;
    return gameState.currentSet === config.setsToWin * 2 - 1;
  }, [config, gameState.currentSet]);

  // Get target points for current set
  const getTargetPoints = useCallback(() => {
    if (!config) return 25;
    return isTiebreak() ? config.tiebreakPoints : config.targetPoints;
  }, [config, isTiebreak]);

  // Check if the set is won
  const checkSetWin = useCallback(
    (score1: number, score2: number): 1 | 2 | null => {
      if (!config) return null;
      const target = getTargetPoints();

      // Check if either team reached the target
      if (score1 >= target || score2 >= target) {
        if (!config.requireTwoPointAdvantage) {
          // No advantage needed, first to target wins
          if (score1 >= target) return 1;
          if (score2 >= target) return 2;
        } else {
          // Need 2 point advantage
          const diff = Math.abs(score1 - score2);
          if (diff >= 2) {
            return score1 > score2 ? 1 : 2;
          }
          // Check max point limit
          if (config.maxPointLimit > 0) {
            if (score1 >= config.maxPointLimit && score1 > score2) return 1;
            if (score2 >= config.maxPointLimit && score2 > score1) return 2;
          }
        }
      }
      return null;
    },
    [config, getTargetPoints]
  );

  // Handle adding a point
  const handleAddPoint = useCallback(
    (team: 1 | 2) => {
      // Prevent adding points while modal is showing
      if (showSetModal) return;

      setGameState((prev) => {
        const newScore1 = team === 1 ? prev.team1Score + 1 : prev.team1Score;
        const newScore2 = team === 2 ? prev.team2Score + 1 : prev.team2Score;

        // Track who reached the target first
        const target = getTargetPoints();
        let newFirstToTarget = prev.firstToTarget;
        if (!newFirstToTarget) {
          if (newScore1 >= target && newScore1 > prev.team1Score) {
            newFirstToTarget = 1;
          } else if (newScore2 >= target && newScore2 > prev.team2Score) {
            newFirstToTarget = 2;
          }
        }

        // Check if set is won
        const setWinner = checkSetWin(newScore1, newScore2);
        if (setWinner) {
          // Set won!
          const newTeam1Sets = setWinner === 1 ? prev.team1Sets + 1 : prev.team1Sets;
          const newTeam2Sets = setWinner === 2 ? prev.team2Sets + 1 : prev.team2Sets;
          const newHistory = [
            ...prev.setHistory,
            { team1: newScore1, team2: newScore2, winner: setWinner },
          ];

          // Show set modal
          if (config) {
            const winnerName = setWinner === 1 ? config.team1Name : config.team2Name;
            const winnerColor = setWinner === 1 ? config.team1Color : config.team2Color;
            setSetModalData({
              winnerName,
              winnerColor,
              setNumber: prev.currentSet,
              score1: newScore1,
              score2: newScore2,
            });
            setShowSetModal(true);

            // Check if match is won and store it for the continue handler
            if (newTeam1Sets >= config.setsToWin || newTeam2Sets >= config.setsToWin) {
              const matchWinnerTeam = newTeam1Sets >= config.setsToWin ? 1 : 2;
              setMatchWinner({
                name: matchWinnerTeam === 1 ? config.team1Name : config.team2Name,
                color: matchWinnerTeam === 1 ? config.team1Color : config.team2Color,
                setsWon: matchWinnerTeam === 1 ? newTeam1Sets : newTeam2Sets,
                setsLost: matchWinnerTeam === 1 ? newTeam2Sets : newTeam1Sets,
              });
            }
          }

          return {
            ...prev,
            team1Score: newScore1,
            team2Score: newScore2,
            team1Sets: newTeam1Sets,
            team2Sets: newTeam2Sets,
            setHistory: newHistory,
            firstToTarget: null, // Reset for next set
          };
        }

        return {
          ...prev,
          team1Score: newScore1,
          team2Score: newScore2,
          firstToTarget: newFirstToTarget,
        };
      });
    },
    [checkSetWin, config, showSetModal, getTargetPoints]
  );

  // Handle subtracting a point
  const handleSubtractPoint = useCallback(
    (team: 1 | 2) => {
      // Prevent subtracting points while modal is showing
      if (showSetModal) return;

      setGameState((prev) => {
        if (team === 1 && prev.team1Score > 0) {
          return { ...prev, team1Score: prev.team1Score - 1 };
        }
        if (team === 2 && prev.team2Score > 0) {
          return { ...prev, team2Score: prev.team2Score - 1 };
        }
        return prev;
      });
    },
    [showSetModal]
  );

  // Handle continuing to next set
  const handleContinueToNextSet = useCallback(() => {
    setShowSetModal(false);
    setSetModalData(null);

    // Check if match is over
    if (matchWinner) {
      // Small delay for smooth transition
      setTimeout(() => {
        setPhase('victory');
      }, 300);
      return;
    }

    // Reset scores for next set
    setGameState((prev) => ({
      ...prev,
      team1Score: 0,
      team2Score: 0,
      currentSet: prev.currentSet + 1,
      firstToTarget: null,
    }));
  }, [matchWinner]);

  // Handle setting current set manually
  const handleSetCurrentSet = useCallback((newSet: number) => {
    if (!config) return;
    const maxSet = config.setsToWin * 2 - 1;
    const validSet = Math.max(1, Math.min(maxSet, newSet));
    setGameState((prev) => ({
      ...prev,
      currentSet: validSet,
      firstToTarget: null,
    }));
  }, [config]);

  // Handle swapping teams
  const handleSwapTeams = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      teamsSwapped: !prev.teamsSwapped,
    }));
  }, []);

  // Handle undo last set
  const handleUndoSet = useCallback(() => {
    if (gameState.setHistory.length === 0) return;

    setGameState((prev) => {
      const newHistory = [...prev.setHistory];
      const lastSet = newHistory.pop();
      if (!lastSet) return prev;

      const newTeam1Sets = lastSet.winner === 1 ? prev.team1Sets - 1 : prev.team1Sets;
      const newTeam2Sets = lastSet.winner === 2 ? prev.team2Sets - 1 : prev.team2Sets;

      return {
        ...prev,
        team1Score: 0,
        team2Score: 0,
        team1Sets: newTeam1Sets,
        team2Sets: newTeam2Sets,
        currentSet: prev.currentSet - 1,
        setHistory: newHistory,
        firstToTarget: null,
      };
    });
  }, [gameState.setHistory]);

  // Handle starting a new match
  const handleStartMatch = useCallback((newConfig: GameConfig) => {
    setConfig(newConfig);
    setGameState({
      team1Score: 0,
      team2Score: 0,
      team1Sets: 0,
      team2Sets: 0,
      currentSet: 1,
      teamsSwapped: false,
      setHistory: [],
      firstToTarget: null,
    });
    setMatchWinner(null);
    setShowSetModal(false);
    setSetModalData(null);
    setPhase('playing');
  }, []);

  // Handle going back to setup
  const handleBackToSetup = useCallback(() => {
    if (window.confirm('Sei sicuro di voler abbandonare la partita in corso?')) {
      setPhase('setup');
      setMatchWinner(null);
    }
  }, []);

  // Handle new match from victory screen
  const handleNewMatch = useCallback(() => {
    setPhase('setup');
    setMatchWinner(null);
  }, []);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      {phase === 'setup' && <SetupScreen onStart={handleStartMatch} />}

      {phase === 'playing' && config && (
        <>
          <GameScreen
            config={config}
            gameState={gameState}
            onAddPoint={handleAddPoint}
            onSubtractPoint={handleSubtractPoint}
            onSwapTeams={handleSwapTeams}
            onUndoSet={handleUndoSet}
            onBackToSetup={handleBackToSetup}
            onSetCurrentSet={handleSetCurrentSet}
          />

          {/* Set Won Modal */}
          {showSetModal && setModalData && (
            <SetWonModal
              winnerName={setModalData.winnerName}
              winnerColor={setModalData.winnerColor}
              setNumber={setModalData.setNumber}
              score1={setModalData.score1}
              score2={setModalData.score2}
              onContinue={handleContinueToNextSet}
            />
          )}
        </>
      )}

      {phase === 'victory' && matchWinner && config && (
        <VictoryScreen
          winnerName={matchWinner.name}
          winnerColor={matchWinner.color}
          setsWon={matchWinner.setsWon}
          setsLost={matchWinner.setsLost}
          setHistory={gameState.setHistory}
          config={config}
          onNewMatch={handleNewMatch}
        />
      )}
    </>
  );
}
