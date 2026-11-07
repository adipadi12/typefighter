/**
 * MatchResults.tsx - Match results screen
 */

import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { useTypingStore } from '../store/typingStore'
import { PlayerState, CombatState } from '../types/game'

const MatchResults: React.FC = () => {
  const {
    player1,
    player2,
    combat,
    setWinner,
    resetRound,
  } = useGameStore()

  const {
    wpm,
    accuracy,
    combo,
    maxCombo,
    streak,
    maxStreak,
  } = useTypingStore()

  // Determine winner
  const determineWinner = (): string => {
    if (player1.health <= 0 && player2.health > 0) return 'Player 1 (You)'
    if (player2.health <= 0 && player1.health > 0) return 'Player 2 (Opponent)'
    if (player1.health <= 0 && player2.health <= 0) return 'Draw'
    return 'Player 1 (You)'
  }

  const winner = determineWinner()

  const matchDuration = combat.gameOver
    ? Math.floor((new Date().getTime() - 30000) / 1000)
    : 0

  const damageDealt1 = 100 - player1.health
  const damageDealt2 = 100 - player2.health
  const totalDamageDealt = damageDealt1 + damageDealt2

  const handleRestart = () => {
    setWinner(null)
    resetRound()
  }

  return (
    <div className="match-results">
      <div className="results-overlay">
        <div className="results-card">
          <h2 className="results-title">Match Results</h2>

          <div className="results-summary">
            <div className="result-item">
              <span className="result-label">Winner</span>
              <span className="result-value">{winner}</span>
            </div>

            <div className="result-item">
              <span className="result-label">Duration</span>
              <span className="result-value">{matchDuration}s</span>
            </div>

            <div className="result-item">
              <span className="result-label">Total Damage</span>
              <span className="result-value">{totalDamageDealt}</span>
            </div>
          </div>

          <div className="performance-stats">
            <h3 className="sub-title">Your Performance</h3>

            <div className="stat-block">
              <span className="stat-label">Average WPM</span>
              <span className="stat-value">{wpm > 0 ? wpm.toLocaleString() : '—'}</span>
            </div>

            <div className="stat-block">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{accuracy > 0 ? accuracy.toFixed(1) : '—'}%</span>
            </div>

            <div className="stat-block">
              <span className="stat-label">Highest Combo</span>
              <span className="stat-value">{maxCombo}</span>
            </div>

            <div className="stat-block">
              <span className="stat-label">Streak</span>
              <span className="stat-value">{maxStreak}x</span>
            </div>
          </div>

          <div className="opponent-stats">
            <h3 className="sub-title">Opponent Performance</h3>

            <div className="stat-block">
              <span className="stat-label">Damage Dealt</span>
              <span className="result-value">{damageDealt2}</span>
            </div>

            <div className="stat-block">
              <span className="stat-label">Final Health</span>
              <span className="result-value">{player2.health}%</span>
            </div>
          </div>

          <button
            className="results-button"
            onClick={handleRestart}
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  )
}

export default MatchResults