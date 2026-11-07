import create from 'zustand'

interface TypingState {
  currentInput: string
  currentPrompt: string
  isTyping: boolean
  streak: number
  maxStreak: number
  wpm: number
  accuracy: number
  charsTyped: number
  charsCorrect: number
  startTime: number | null
  lastActionTime: number
  combo: number
  maxCombo: number
  lastResult: any
  actionHistory: string[]

  setCurrentInput: (input: string) => void
  setTyping: (isTyping: boolean) => void
  addStreak: (amount: number) => void
  resetStreak: () => void
  setWPM: (wpm: number) => void
  setAccuracy: (accuracy: number) => void
  addChars: (total: number, correct: number) => void
  resetStats: () => void
  setLastResult: (result: any) => void
  addToHistory: (action: string) => void
  clearHistory: () => void
}

export const useTypingStore = create<TypingState>((set, get) => ({
  currentInput: '',
  currentPrompt: '',
  isTyping: false,
  streak: 0,
  maxStreak: 0,
  wpm: 0,
  accuracy: 100,
  charsTyped: 0,
  charsCorrect: 0,
  startTime: null,
  lastActionTime: 0,
  combo: 0,
  maxCombo: 0,
  lastResult: null,
  actionHistory: [],

  setCurrentInput: (input) => set({ currentInput: input }),

  setTyping: (isTyping) => set({ isTyping }),

  addStreak: (amount) =>
    set((state) => {
      const newStreak = state.streak + amount
      const newMaxStreak = Math.max(state.maxStreak, newStreak)
      return { streak: newStreak, maxStreak: newMaxStreak }
    }),

  resetStreak: () => set({ streak: 0, maxStreak: 0 }),

  setWPM: (wpm) => set({ wpm }),

  setAccuracy: (accuracy) => set({ accuracy }),

  addChars: (total, correct) =>
    set((state) => {
      const newTotal = state.charsTyped + total
      const newCorrect = state.charsCorrect + correct
      const newAccuracy = newTotal > 0 ? (newCorrect / newTotal) * 100 : 100
      return { charsTyped: newTotal, charsCorrect: newCorrect, accuracy: newAccuracy }
    }),

  resetStats: () =>
    set({
      currentInput: '',
      charsTyped: 0,
      charsCorrect: 0,
      wpm: 0,
      accuracy: 100,
      streak: 0,
      maxStreak: 0,
      combo: 0,
      maxCombo: 0,
      startTime: null,
    }),

  setLastResult: (result) => set({ lastResult: result }),

  addToHistory: (action) =>
    set((state) => ({
      actionHistory: [...state.actionHistory, action],
    })),

  clearHistory: () => set({ actionHistory: [] }),
}))