/**
 * MainMenu.tsx - Main menu component
 */

import { useState } from 'react'

const MainMenu: React.FC = ({ onStart }: { onStart: () => void }) => {
  const [selectedMode, setSelectedMode] = useState<'practice' | 'match' | 'settings'>('match')

  const handlePlayModeChange = (mode: 'practice' | 'match' | 'settings') => {
    setSelectedMode(mode)
  }

  const startGame = () => {
    onStart()
  }

  return (
    <div className="main-menu">
      <div className="menu-header">
        <h1 className="menu-title">Typing Fighter</h1>
        <p className="menu-subtitle">Type to Attack. Type to Defend.</p>
      </div>

      <div className="menu-options">
        <button
          className="menu-button"
          onClick={() => {
            handlePlayModeChange('match')
            startGame()
          }}
        >
          Play Match
        </button>
        <button
          className="menu-button"
          onClick={() => handlePlayModeChange('practice')}
        >
          Practice Mode
        </button>
        <button
          className="menu-button"
          onClick={() => handlePlayModeChange('settings')}
        >
          Settings
        </button>
      </div>

      <div className="menu-footer">
        <p>Use your typing speed to defeat your opponent</p>
      </div>
    </div>
  )
}

export default MainMenu