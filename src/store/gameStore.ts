import create from 'zustand'
import {
  PlayerState, CombatState, ActionType,
  TypingResult
} from '../types/game'

interface GameState {
  player1: PlayerState
  player2: PlayerState
  combat: CombatState
  currentTurn: 'player1' | 'player2'
  typing: ReturnType<typeof import('../store/typingStore').useTypingStore>['getState']

  setCurrentInput: (input: string) => void
  triggerAction: (action: ActionType, input: string) => TypingResult
  resetRound: () => void
  updateCombatState: (update: Partial<CombatState>) => void
  setWinner: (winner: string) => void

  getActivePlayer: () => PlayerState
  getOpponent: () => PlayerState
  isGameOver: () => boolean
}

const createInitialPlayer = (id: string): PlayerState => ({
  id,
  health: 100,
  maxHealth: 100,
  stamina: 100,
  maxStamina: 100,
  attackPower: 10,
  comboCounter: 0,
  maxCombo: 0,
  isAlive: true,
})

const createInitialCombat = (): CombatState => ({
  player1: createInitialPlayer('player1'),
  player2: createInitialPlayer('player2'),
  turn: 'player1',
  gameOver: false,
  winner: null,
})

export const useGameStore = create<GameState>((set, get) => ({
  player1: createInitialPlayer('player1'),
  player2: createInitialPlayer('player2'),
  combat: createInitialCombat(),
  currentTurn: 'player1',
  typing: {} as any,

  setCurrentInput: (input) => {
    const typingStore = get().typing
    typingStore.setCurrentInput(input)
    const result = get().processTypingInput(input)
    get().triggerAction(result.action || ActionType.SLASH, input)
  },

  triggerAction: (action: ActionType, input: string): TypingResult => {
    const typingStore = get().typing
    const currentTime = Date.now()
    const timeTaken = typingStore.startTime
      ? currentTime - typingStore.startTime
      : 0

    let correctChars = 0
    let totalChars = input.length
    const prompt = typingStore.currentPrompt
    if (prompt && typingStore.isTyping) {
      const promptChars = prompt.split('')
      const inputChars = input.split('')
      let matches = 0
      for (let i = 0; i < Math.min(promptChars.length, inputChars.length); i++) {
        if (promptChars[i] === inputChars[i]) matches++
      }
      correctChars = matches
    }
    const total = totalChars || prompt?.length || 1
    const accuracy = total > 0 ? (correctChars / total) * 100 : 100

    let damage = 0
    let staminaCost = 0
    let comboBroken = false
    let streakBroken = false

    if (action === ActionType.SLASH) {
      staminaCost = 15
      damage = Math.round(10 * (accuracy / 100) * (typingStore.combo / 10))
    } else if (action === ActionType.HEAVY) {
      staminaCost = 30
      damage = Math.round(25 * (accuracy / 100) * (typingStore.combo / 10))
    } else if (action === ActionType.THRUST) {
      staminaCost = 20
      damage = Math.round(15 * (accuracy / 100) * (typingStore.combo / 10))
    } else if (action === ActionType.PARRY) {
      staminaCost = 20
      damage = 0
    } else if (action === ActionType.DODGE) {
      staminaCost = 25
      damage = 0
    } else if (action === ActionType.COUNTER) {
      staminaCost = 25
      damage = Math.round(20 * (accuracy / 100) * (typingStore.combo / 10))
    }

    let newPlayer1Stamina = typingStore.currentPlayer === 'player1'
      ? Math.max(0, typingStore.player1.stamina - staminaCost)
      : typingStore.player1.stamina
    let newPlayer2Stamina = typingStore.currentPlayer === 'player2'
      ? Math.max(0, typingStore.player2.stamina - staminaCost)
      : typingStore.player2.stamina

    if (staminaCost > 0 && typingStore.player1.stamina < staminaCost) {
      comboBroken = true
    }

    let newCombo = typingStore.combo
    if (accuracy >= 80 && !comboBroken) {
      newCombo = Math.min(100, typingStore.combo + 5)
    } else {
      comboBroken = true
      newCombo = 0
    }
    const maxCombo = Math.max(typingStore.maxCombo, newCombo)

    let newStreak = typingStore.streak
    let newMaxStreak = typingStore.maxStreak
    if (accuracy >= 80) {
      newStreak = Math.min(50, typingStore.streak + 1)
      newMaxStreak = Math.max(newMaxStreak, newStreak)
    } else {
      streakBroken = true
      newStreak = 0
    }

    const wordsTyped = typingStore.wordsTyped || 0
    const timeMinutes = typingStore.startTime ? (timeTaken / 60000) : 0.01
    const newWPM = timeMinutes > 0 ? Math.round((wordsTyped / timeMinutes) * 60) : 0

    const result: TypingResult = {
      success: accuracy >= 80,
      action: Object.values(ActionType).includes(action) ? action : null,
      correctChars,
      totalChars: total,
      comboBroken,
      streakBroken,
    }

    const player1 = { ...typingStore.player1 }
    const player2 = { ...typingStore.player2 }

    if (action === ActionType.SLASH && typingStore.currentPlayer === 'player1') {
      player1.health = Math.max(0, player1.health - 0)
      player1.stamina = newPlayer1Stamina
      player1.comboCounter = newCombo
    } else if (action === ActionType.SLASH && typingStore.currentPlayer === 'player2') {
      player2.health = Math.max(0, player2.health - 0)
      player2.stamina = newPlayer2Stamina
      player2.comboCounter = newCombo
    }

    const newActionHistory = [...typingStore.actionHistory, action].filter(
      (a, i) => i === typingStore.actionHistory.length
    )

    return set({
      player1,
      player2,
      typing: {
        ...typingStore,
        currentInput: '',
        streak: newStreak,
        maxStreak: newMaxStreak,
        combo: newCombo,
        maxCombo: maxCombo,
        wpm: newWPM,
        accuracy,
        lastResult: result,
        actionHistory: newActionHistory,
      },
    }, 'triggerAction')
  },

  resetRound: () => {
    set({
      player1: createInitialPlayer('player1'),
      player2: createInitialPlayer('player2'),
      combat: createInitialCombat(),
      currentTurn: 'player1',
    })
  },

  updateCombatState: (update) =>
    set((state) => ({ combat: { ...state.combat, ...update } })),

  setWinner: (winner) =>
    set({
      combat: { ...state.combat, gameOver: true, winner },
      currentTurn: winner === 'player1' ? 'player2' : 'player1',
    }),

  getActivePlayer: () => {
    const turn = get().currentTurn
    return turn === 'player1' ? get().player1 : get().player2
  },

  getOpponent: () => {
    const turn = get().currentTurn
    return turn === 'player1' ? get().player2 : get().player1
  },

  isGameOver: () => {
    const { player1, player2, combat } = get()
    return combat.gameOver || player1.health <= 0 || player2.health <= 0
  },
}))