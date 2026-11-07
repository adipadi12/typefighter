/**
 * MatchHUD.tsx - Match heads-up display
 */

import { useRef, useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { useTypingStore } from '../store/typingStore'
import { PlayerState, CombatState, ActionType } from '../types/game'

const MatchHUD: React.FC = () => {
  const {
    player1,
    player2,
    combat,
    currentTurn,
    isGameOver,
  } = useGameStore()

  const {
    currentPrompt,
    isTyping,
    wpm,
    accuracy,
    combo,
    maxCombo,
    streak,
    maxStreak,
    lastResult,
  } = useTypingStore()

  // Timer state
  const [matchTime, setMatchTime] = useState(0)
  const timerRef = useRef<number | null>(null)

  // Start timer when match begins
  useEffect(() => {
    const id = setInterval(() => {
      setMatchTime((prev) => prev + 1)
    }, 1000)
    timerRef.current = id
    return () => clearInterval(id)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Get current player and opponent based on turn
  const activePlayer = currentTurn === 'player1' ? player1 : player2
  const opponentPlayer = currentTurn === 'player1' ? player2 : player1

  // Format time
  const minutes = Math.floor(matchTime / 60)
  const seconds = matchTime % 60
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

  // Determine whose turn it is visually
  const turnLabel = currentTurn === 'player1' ? 'Your Turn' : 'Opponent'

  // Get the action type string for display
  const actionToString = (action: ActionType | null): string => {
    if (!action) return '—'
    return ActionType[action] || String(action)
  }

  // Parry indicator for opponent's incoming attack
  const parryIndicator = lastResult
    ? lastResult.success && lastResult.action === ActionType.PARRY
      ? '✓ Parry Successful!'
      : ''
    : ''

  return (
    <div className="match-hud">
      {/* Turn indicator */}
      <div className="turn-indicator">
        <span>{turnLabel}</span>
        <span>({actionToString(lastResult?.action)})</span>
      </div>

      {/* Player 1 (Left) - Local Player */}
      <div className="player-panel player1">
        <div className="panel-header">YOU</div>
        <div className="health-bar-container">
          <div className="health-bar-label">Health</div>
          <div
            className="health-bar-bar"
            style={{
              width: `${player1.health}%`,
            }}
          >
            <div className="health-bar-fill"
                 style={{ background: player1.health > 25 ? '#4ade80' : '#f87171' }}
            ></div>
          </div>
          <span className="health-bar-text">{player1.health}%</span>
        </div>

        <div className="stamina-bar-container">
          <div className="stamina-bar-label">Stamina</div>
          <div
            className="stamina-bar-bar"
            style={{
              width: `${player1.stamina}%`,
            }}
          >
            <div className="stamina-bar-fill"
                 style={{ background: player1.stamina > 30 ? '#60a5fa' : '#fbbf24' }}
            ></div>
          </div>
          <span className="stamina-bar-text">{player1.stamina}%</span>
        </div>

        <div className="combo-counter">
          <span>Combo:</span>
          <span className="combo-value">{combo > 0 ? combo : 0}</span>
          <span className="combo-max">/{maxCombo}</span>
        </div>
      </div>

      {/* Player 2 (Right) - Opponent */}
      <div className="player-panel player2">
        <div className="panel-header">OPPONENT</div>
        <div className="health-bar-container">
          <div className="health-bar-label">Health</div>
          <div
            className="health-bar-bar"
            style={{
              width: `${player2.health}%`,
            }}
          >
            <div className="health-bar-fill"
                 style={{ background: player2.health > 25 ? '#4ade80' : '#f87171' }}
            ></div>
          </div>
          <span className="health-bar-text">{player2.health}%</span>
        </div>

        <div className="stamina-bar-container">
          <div className="stamina-bar-label">Stamina</div>
          <div
            className="stamina-bar-bar"
            style={{
              width: `${player2.stamina}%`,
            }}
          >
            <div className="stamina-bar-fill"
                 style={{ background: player2.stamina > 30 ? '#60a5fa' : '#fbbf24' }}
            ></div>
          </div>
          <span className="stamina-bar-text">{player2.stamina}%</span>
        </div>

        <div className="combo-counter">
          <span>Combo:</span>
          <span className="combo-value">{combo > 0 ? combo : 0}</span>
          <span className="combo-max">/{maxCombo}</span>
        </div>
      </div>

      {/* Center typing interface */}
      <div className="typing-interface">
        {/* Current prompt */}
        <div className="typing-prompt">
          <span>Prompt: </span>
          <span className="prompt-text">
            {currentPrompt || 'Waiting for match...'}
          </span>
        </div>

        {/* WPM and Accuracy */}
        <div className="stats-row">
          <div className="stat-item">
            <span>WPM: </span>
            <span className="stat-value">{wpm > 0 ? wpm : '—'}</span>
          </div>
          <div className="stat-item">
            <span>Acc: </span>
            <span className="stat-value">{accuracy > 0 ? `${accuracy.toFixed(1)}%` : '—'}</span>
          </div>
        </div>

        {/* Combo streak */}
        <div className="streak-info">
          <span>Streak: </span>
          <span className="streak-value">
            {streak > 0 ? `${streak}x` : '—'}
          </span>
        </div>
      </div>

      {/* Opponent attack indicator */}
      <div className="opponent-indicator">
        {parryIndicator && (
          <div className="parry-flash">
            <span>Opponent attacking! Parry opportunity!</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default MatchHUD