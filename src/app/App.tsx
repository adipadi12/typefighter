import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'
import { useTypingStore } from '../store/typingStore'
import MainMenu from '../components/MainMenu'
import MatchHUD from '../components/MatchHUD'
import MatchResults from '../components/MatchResults'

const ActionType: Record<string, string> = {
  SLASH: 'slash',
  HEAVY: 'heavy',
  THRUST: 'thrust',
  PARRY: 'parry',
  DODGE: 'dodge',
  COUNTER: 'counter',
}

const App: React.FC = () => {
  const [showMenu, setShowMenu] = useState(true)
  const [showResults, setShowResults] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const {
    player1,
    player2,
    combat,
    currentTurn,
    typing,
    setCurrentInput,
    triggerAction,
    resetRound,
    updateCombatState,
    setWinner,
    isGameOver,
  } = useGameStore()

  const {
    currentInput,
    currentPrompt,
    isTyping,
    streak,
    maxStreak,
    wpm,
    accuracy,
    combo,
    maxCombo,
    lastResult,
    setTyping,
    addToHistory,
    clearHistory,
    resetStats,
  } = useTypingStore()

  const startMatch = () => {
    setShowMenu(false)
    setShowResults(false)
    resetRound()
    resetStats()
    const initialPrompt = 'slash'
    setTyping({ ...typing, currentPrompt: initialPrompt, isTyping: true })
  }

  const handleInput = (input: string) => {
    setCurrentInput(input)
    const result = triggerAction(ActionType.SLASH, input)

    if (result.action) {
      addToHistory(result.action)
    }

    setTyping({
      ...typing,
      currentInput: '',
      streak: result.streak ?? typing.streak,
      maxStreak: result.maxStreak ?? typing.maxStreak,
      combo: result.combo ?? typing.combo,
      maxCombo: result.maxCombo ?? typing.maxCombo,
      wpm: result.wpm ?? typing.wpm,
      accuracy: result.accuracy ?? typing.accuracy,
      lastResult: result,
    })

    if (isGameOver()) {
      setShowResults(true)
      setShowMenu(false)
    }
  }

  const restartMatch = () => {
    setShowResults(false)
    setShowMenu(true)
    startMatch()
  }

  const aiAction = () => {
    const actions = ['slash', 'parry', 'dodge']
    const randomAction = actions[Math.floor(Math.random() * actions.length)]
    setTimeout(() => {
      handleInput(randomAction)
    }, 500)
  }

  return (
    <div className="app-container">
      {showMenu && <MainMenu onStart={startMatch} />}

      {!showMenu && !showResults && (
        <div className="game-wrapper">
          <Canvas
            ref={canvasRef}
            camera={{ position: [0, 10, 15], fov: 60 }}
            resize
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 7]} intensity={1} castShadow />

            <MatchHUD
              player1={player1}
              player2={player2}
              currentPrompt={currentPrompt}
              isTyping={isTyping}
              wpm={wpm}
              accuracy={accuracy}
              combo={combo}
              maxCombo={maxCombo}
              streak={streak}
              maxStreak={maxStreak}
              lastResult={lastResult}
              onTypingInput={handleInput}
            />
          </Canvas>
        </div>
      )}

      {showResults && <MatchResults onRestart={restartMatch} />}
    </div>
  )
}

export default App